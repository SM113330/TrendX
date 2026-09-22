import os
from pathlib import Path
from time import time

import requests
from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_ROOT / ".env"

load_dotenv(dotenv_path=ENV_PATH)

# YouTube search is quota-expensive. Cache per topic so TrendX can refresh its
# news feed frequently without burning API quota on identical queries.
YOUTUBE_CACHE_SECONDS = 60 * 60 * 4
_youtube_cache = {}


def _empty_result():
    return {
        "signal": 0,
        "thumbnail": None,
        "reactions": [],
        "videos": [],
        "primary_video": None,
    }


def _cached(query: str):
    key = query.strip().lower()
    hit = _youtube_cache.get(key)

    if not hit:
        return None

    if time() - hit["cached_at"] > YOUTUBE_CACHE_SECONDS:
        _youtube_cache.pop(key, None)
        return None

    return hit["data"]


def _store(query: str, data):
    _youtube_cache[query.strip().lower()] = {
        "cached_at": time(),
        "data": data,
    }


def fetch_youtube_data(query: str):
    cached = _cached(query)
    if cached:
        return cached

    youtube_api_key = os.getenv("YOUTUBE_API_KEY")

    if not youtube_api_key:
        return _empty_result()

    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 5,
        "order": "relevance",
        "key": youtube_api_key,
    }

    try:
        response = requests.get(search_url, params=search_params, timeout=10)
        data = response.json()

        if response.status_code != 200:
            print("YouTube Raw Error:", data)
            return _empty_result()

        items = data.get("items", [])
        video_ids = [
            item.get("id", {}).get("videoId")
            for item in items
            if item.get("id", {}).get("videoId")
        ]

        stats_by_id = {}

        if video_ids:
            stats_url = "https://www.googleapis.com/youtube/v3/videos"
            stats_params = {
                "part": "statistics,snippet",
                "id": ",".join(video_ids),
                "key": youtube_api_key,
            }

            stats_response = requests.get(
                stats_url,
                params=stats_params,
                timeout=10,
            )

            if stats_response.status_code == 200:
                for video in stats_response.json().get("items", []):
                    stats_by_id[video.get("id")] = {
                        "statistics": video.get("statistics", {}),
                        "snippet": video.get("snippet", {}),
                    }

        videos = []
        signal = 0

        for item in items:
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            snippet = item.get("snippet", {})
            stat_entry = stats_by_id.get(video_id, {})
            stats = stat_entry.get("statistics", {})

            views = int(stats.get("viewCount") or 0)
            likes = int(stats.get("likeCount") or 0)
            comments = int(stats.get("commentCount") or 0)

            signal += views + likes * 8 + comments * 40

            thumbnails = snippet.get("thumbnails", {})
            thumbnail = (
                thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
            )

            videos.append(
                {
                    "video_id": video_id,
                    "title": snippet.get("title", ""),
                    "channel_title": snippet.get("channelTitle", ""),
                    "thumbnail": thumbnail,
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "embed_url": f"https://www.youtube.com/embed/{video_id}",
                    "views": views,
                    "likes": likes,
                    "comments": comments,
                    "published_at": snippet.get("publishedAt"),
                }
            )

        if signal <= 0:
            signal = len(items) * 25000

        thumbnail = videos[0]["thumbnail"] if videos else None

        reactions = []

        def meaningful_comment(text: str) -> bool:
            cleaned = " ".join(text.split())
            letters = sum(char.isalpha() for char in cleaned)
            return len(cleaned) >= 20 and letters >= 14

        # Scan more than one related video before deciding comments are absent.
        for item in items[:5]:
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            comment_url = "https://www.googleapis.com/youtube/v3/commentThreads"
            comment_params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": 12,
                "order": "relevance",
                "textFormat": "plainText",
                "key": youtube_api_key,
            }

            comment_response = requests.get(
                comment_url,
                params=comment_params,
                timeout=10,
            )

            if comment_response.status_code != 200:
                continue

            video_title = item.get("snippet", {}).get("title", "")

            for thread in comment_response.json().get("items", []):
                top = (
                    thread.get("snippet", {})
                    .get("topLevelComment", {})
                    .get("snippet", {})
                )

                text = (top.get("textDisplay") or "").strip()
                author = (top.get("authorDisplayName") or "YouTube user").strip()

                if not text or not meaningful_comment(text):
                    continue

                reactions.append(
                    {
                        "platform": "YouTube",
                        "author": author,
                        "avatar_url": top.get("authorProfileImageUrl"),
                        "text": text[:700],
                        "likes": int(top.get("likeCount") or 0),
                        "published_at": top.get("publishedAt"),
                        "video_title": video_title,
                        "video_id": video_id,
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                    }
                )

            if len(reactions) >= 6:
                break

        # Deduplicate repeated comments and keep the strongest.
        unique = {}
        for reaction in reactions:
            key = reaction["text"].strip().lower()
            previous = unique.get(key)
            if previous is None or reaction["likes"] > previous["likes"]:
                unique[key] = reaction

        reactions = sorted(
            unique.values(),
            key=lambda item: item.get("likes", 0),
            reverse=True,
        )[:6]

        result = {
            "signal": signal,
            "thumbnail": thumbnail,
            "reactions": reactions,
            "videos": videos[:3],
            "primary_video": videos[0] if videos else None,
        }

        _store(query, result)
        return result

    except Exception as error:
        print("YouTube data failed:", error)
        return _empty_result()


def fetch_youtube_signal(query: str) -> int:
    return fetch_youtube_data(query)["signal"]
