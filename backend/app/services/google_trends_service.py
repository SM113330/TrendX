import re
import html
from urllib.parse import urljoin

import feedparser
import requests
from bs4 import BeautifulSoup

from app.services.analyst_service import generate_analysis
from app.services.youtube_service import fetch_youtube_data
from app.services.scoring_service import calculate_trend_score


REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/153.0 Safari/537.36"
    )
}


def create_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def clean_summary(raw_summary: str) -> str:
    if not raw_summary:
        return ""

    text = re.sub(r"<[^>]+>", " ", raw_summary)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def create_human_gist(title: str, raw_summary: str) -> str:
    cleaned = clean_summary(raw_summary)

    if cleaned:
        return cleaned[:420]

    return (
        f"{title} is receiving strong live news attention. "
        "Open the original source for the latest reporting and use TRENDX "
        "to compare its current momentum with other active stories."
    )


def extract_source(entry) -> str:
    try:
        return entry.get("source", {}).get("title", "Google News")
    except Exception:
        return "Google News"


def extract_feed_image(entry):
    try:
        if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            return entry.media_thumbnail[0].get("url")

        if hasattr(entry, "media_content") and entry.media_content:
            return entry.media_content[0].get("url")

        if "media_thumbnail" in entry and entry.media_thumbnail:
            return entry.media_thumbnail[0].get("url")

        if "media_content" in entry and entry.media_content:
            return entry.media_content[0].get("url")

        if hasattr(entry, "links") and entry.links:
            for link in entry.links:
                if link.get("type", "").startswith("image"):
                    return link.get("href")
    except Exception:
        pass

    return None


def extract_open_graph_image(article_url: str):
    if not article_url:
        return None

    try:
        response = requests.get(
            article_url,
            headers=REQUEST_HEADERS,
            timeout=6,
            allow_redirects=True,
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        candidates = [
            ("property", "og:image"),
            ("property", "og:image:url"),
            ("name", "twitter:image"),
            ("name", "twitter:image:src"),
        ]

        for attribute, value in candidates:
            tag = soup.find("meta", attrs={attribute: value})
            if tag and tag.get("content"):
                return urljoin(response.url, tag["content"].strip())

        image = soup.find("img", src=True)
        if image:
            return urljoin(response.url, image["src"])

    except Exception as error:
        print("Image metadata fetch failed:", article_url, error)

    return None


def infer_category(title: str) -> str:
    text = title.lower()

    category_rules = [
        ("Sports", ["cricket", "football", "ipl", "fifa", "wwe", "tennis", "match", "series win", "world cup"]),
        ("Technology", ["apple", "iphone", "android", "microsoft", "google", "openai", "ai ", "chip", "tesla", "robot", "software", "tech"]),
        ("Entertainment", ["movie", "film", "actor", "actress", "bollywood", "hollywood", "netflix", "trailer", "music", "series"]),
        ("Gaming", ["gaming", "game ", "playstation", "xbox", "nintendo", "steam", "esports"]),
        ("Business", ["market", "stocks", "shares", "bank", "economy", "trade", "company", "revenue", "funding"]),
    ]

    for category, keywords in category_rules:
        if any(keyword in text for keyword in keywords):
            return category

    return "Live News"


def create_momentum(score: int):
    return [
        max(score - 35, 10),
        max(score - 25, 15),
        max(score - 18, 20),
        max(score - 10, 30),
        max(score - 5, 35),
        score,
    ]


def calculate_direction(score: int) -> str:
    if score >= 80:
        return "rocket"
    if score >= 45:
        return "up"
    return "down"


def fetch_google_trends():
    url = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(url)

    if not feed.entries:
        print("Google News RSS failed or returned empty.")
        return None

    results = []

    for index, entry in enumerate(feed.entries[:16], start=1):
        title = entry.title.split(" - ")[0].strip()
        news_score = max(100 - index * 5, 30)
        velocity = news_score
        sentiment = 75
        direction = calculate_direction(news_score)

        youtube_data = fetch_youtube_data(title)
        youtube_signal = youtube_data["signal"]
        youtube_thumbnail = youtube_data["thumbnail"]
        youtube_for_score = youtube_signal if youtube_signal > 0 else int(news_score * 620)

        scoring = calculate_trend_score(
            news_score=news_score,
            momentum_score=news_score,
            youtube_signal=youtube_for_score,
            velocity_score=news_score,
        )

        article_link = entry.link
        image_url = (
            extract_feed_image(entry)
            or extract_open_graph_image(article_link)
            or youtube_thumbnail
        )

        results.append(
            {
                "id": index,
                "title": title,
                "slug": create_slug(title),
                "category": infer_category(title),
                "engagement": news_score * 1000,
                "velocity": velocity,
                "sentiment": sentiment,
                "score": scoring["score"],
                "direction": direction,
                "momentum": create_momentum(news_score),
                "summary": create_human_gist(title, getattr(entry, "summary", "")),
                "analysis": generate_analysis(title, scoring["score"], extract_source(entry)),
                "score_breakdown": scoring["score_breakdown"],
                "platform_metrics": {
                    "news": news_score * 1000,
                    "youtube": youtube_for_score,
                    "x": int(news_score * 850),
                    "instagram": int(news_score * 540),
                },
                "source": extract_source(entry),
                "link": article_link,
                "image_url": image_url,
            }
        )

    return results
