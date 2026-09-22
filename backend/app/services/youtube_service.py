import os
from pathlib import Path

import requests
from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_ROOT / ".env"

load_dotenv(dotenv_path=ENV_PATH)


def _empty_result():
    return {
        "signal": 0,
        "thumbnail": None,
        "reactions": [],
    }


def fetch_youtube_data(query: str):
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
        signal = len(items) * 25000

        thumbnail = None
        if items:
            thumbnails = items[0].get("snippet", {}).get("thumbnails", {})
            thumbnail = (
                thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
                or thumbnails.get("default", {}).get("url")
            )

        reactions = []

        def meaningful_comment(text: str) -> bool:
            cleaned = " ".join(text.split())
            letters = sum(char.isalpha() for char in cleaned)
            return len(cleaned) >= 28 and letters >= 18

        for item in items[:3]:
            video_id = item.get("id", {}).get("videoId")
            if not video_id:
                continue

            comment_url = "https://www.googleapis.com/youtube/v3/commentThreads"
            comment_params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": 5,
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
                        "text": text[:500],
                        "likes": int(top.get("likeCount") or 0),
                        "published_at": top.get("publishedAt"),
                        "video_title": video_title,
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                    }
                )

            if reactions:
                break

        reactions.sort(key=lambda item: item.get("likes", 0), reverse=True)

        return {
            "signal": signal,
            "thumbnail": thumbnail,
            "reactions": reactions[:3],
        }

    except Exception as error:
        print("YouTube data failed:", error)
        return _empty_result()


def fetch_youtube_signal(query: str) -> int:
    return fetch_youtube_data(query)["signal"]
