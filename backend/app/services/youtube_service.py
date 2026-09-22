import os
from pathlib import Path
from time import time

import requests
from dotenv import load_dotenv
from yt_dlp import YoutubeDL


BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_ROOT / ".env"

load_dotenv(dotenv_path=ENV_PATH)

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


def _thumbnail_from_entry(entry):
    thumbnails = entry.get("thumbnails") or []

    if isinstance(thumbnails, list) and thumbnails:
        for candidate in reversed(thumbnails):
            url = candidate.get("url")
            if url:
                return url

    return entry.get("thumbnail")


def _public_youtube_search(query: str):
    try:
        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "extract_flat": "in_playlist",
            "playlistend": 5,
            "socket_timeout": 8,
        }

        with YoutubeDL(options) as ydl:
            result = ydl.extract_info(
                f"ytsearch5:{query}",
                download=False,
            )

        entries = result.get("entries", []) if isinstance(result, dict) else []
        normalized = []

        for entry in entries:
            if not entry:
                continue

            video_id = entry.get("id")
            if not video_id:
                continue

            normalized.append(
                {
                    "video_id": video_id,
                    "title": entry.get("title", ""),
                    "channel_title": (
                        entry.get("channel")
                        or entry.get("uploader")
                        or entry.get("channel_id")
                        or ""
                    ),
                    "thumbnail": _thumbnail_from_entry(entry),
                    "published_at": entry.get("timestamp"),
                }
            )

        return normalized

    except Exception as error:
        print("Public YouTube search failed:", error)
        return []


def _api_youtube_search(query: str, youtube_api_key: str):
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 5,
        "order": "relevance",
        "key": youtube_api_key,
    }

    response = requests.get(search_url, params=search_params, timeout=10)
    data = response.json()

    if response.status_code != 200:
        print("YouTube Search Error:", data)
        return []

    normalized = []

    for item in data.get("items", []):
        video_id = item.get("id", {}).get("videoId")
        if not video_id:
            continue

        snippet = item.get("snippet", {})
        thumbnails = snippet.get("thumbnails", {})

        normalized.append(
            {
                "video_id": video_id,
                "title": snippet.get("title", ""),
                "channel_title": snippet.get("channelTitle", ""),
                "thumbnail": (
                    thumbnails.get("high", {}).get("url")
                    or thumbnails.get("medium", {}).get("url")
                    or thumbnails.get("default", {}).get("url")
                ),
                "published_at": snippet.get("publishedAt"),
            }
        )

    return normalized


def fetch_youtube_data(query: str):
    cached = _cached(query)
    if cached:
        return cached

    youtube_api_key = os.getenv("YOUTUBE_API_KEY")

    # Prefer the official search endpoint when quota is available.
    # When its daily search quota is exhausted, fall back to public search
    # discovery and continue using the API only for low-cost stats/comments.
    candidates = []

    if youtube_api_key:
        try:
            candidates = _api_youtube_search(query, youtube_api_key)
        except Exception as error:
            print("YouTube API search failed:", error)

    if not candidates:
        candidates = _public_youtube_search(query)

    if not candidates:
        return _empty_result()

    video_ids = [item["video_id"] for item in candidates]
    stats_by_id = {}

    if youtube_api_key and video_ids:
        try:
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
        except Exception as error:
            print("YouTube stats failed:", error)

    videos = []
    signal = 0

    for candidate in candidates:
        video_id = candidate["video_id"]
        stat_entry = stats_by_id.get(video_id, {})
        stats = stat_entry.get("statistics", {})
        snippet = stat_entry.get("snippet", {})

        views = int(stats.get("viewCount") or 0)
        likes = int(stats.get("likeCount") or 0)
        comments = int(stats.get("commentCount") or 0)

        signal += views + likes * 8 + comments * 40

        videos.append(
            {
                "video_id": video_id,
                "title": snippet.get("title") or candidate.get("title", ""),
                "channel_title": (
                    snippet.get("channelTitle")
                    or candidate.get("channel_title", "")
                ),
                "thumbnail": candidate.get("thumbnail"),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "embed_url": f"https://www.youtube.com/embed/{video_id}",
                "views": views,
                "likes": likes,
                "comments": comments,
                "published_at": (
                    snippet.get("publishedAt")
                    or candidate.get("published_at")
                ),
            }
        )

    if signal <= 0:
        signal = len(videos) * 25000

    reactions = []

    def meaningful_comment(text: str) -> bool:
        cleaned = " ".join(text.split())
        letters = sum(char.isalpha() for char in cleaned)
        return len(cleaned) >= 20 and letters >= 14

    if youtube_api_key:
        for video in videos[:5]:
            video_id = video["video_id"]

            try:
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

                for thread in comment_response.json().get("items", []):
                    top = (
                        thread.get("snippet", {})
                        .get("topLevelComment", {})
                        .get("snippet", {})
                    )

                    text = (top.get("textDisplay") or "").strip()
                    author = (
                        top.get("authorDisplayName")
                        or "YouTube user"
                    ).strip()

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
                            "video_title": video["title"],
                            "video_id": video_id,
                            "url": video["url"],
                        }
                    )

                if len(reactions) >= 6:
                    break

            except Exception as error:
                print("YouTube comments failed:", video_id, error)

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
        "thumbnail": videos[0]["thumbnail"] if videos else None,
        "reactions": reactions,
        "videos": videos[:3],
        "primary_video": videos[0] if videos else None,
    }

    _store(query, result)
    return result


def fetch_youtube_signal(query: str) -> int:
    return fetch_youtube_data(query)["signal"]
