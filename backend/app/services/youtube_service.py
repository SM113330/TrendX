import os
from pathlib import Path

import requests
from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = BACKEND_ROOT / ".env"

load_dotenv(dotenv_path=ENV_PATH)


def fetch_youtube_data(query: str):
    youtube_api_key = os.getenv("YOUTUBE_API_KEY")

    if not youtube_api_key:
        return {
            "signal": 0,
            "thumbnail": None,
        }

    url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 10,
        "order": "relevance",
        "key": youtube_api_key,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code != 200:
            print("YouTube Raw Error:", data)
            return {
                "signal": 0,
                "thumbnail": None,
            }

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

        return {
            "signal": signal,
            "thumbnail": thumbnail,
        }

    except Exception as error:
        print("YouTube data failed:", error)

        return {
            "signal": 0,
            "thumbnail": None,
        }


def fetch_youtube_signal(query: str) -> int:
    return fetch_youtube_data(query)["signal"]