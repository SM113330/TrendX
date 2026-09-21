import asyncio
import html
import re
from urllib.parse import urljoin

import feedparser
import requests
from bs4 import BeautifulSoup
from googlenewsdecoder import gnews_decoder_async

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


def extract_article_brief(article_url: str):
    fallback = {
        "image_url": None,
        "article_summary": None,
        "key_points": [],
    }

    if not article_url:
        return fallback

    try:
        response = requests.get(
            article_url,
            headers=REQUEST_HEADERS,
            timeout=8,
            allow_redirects=True,
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        image_url = None
        for attribute, value in [
            ("property", "og:image"),
            ("property", "og:image:url"),
            ("name", "twitter:image"),
            ("name", "twitter:image:src"),
        ]:
            tag = soup.find("meta", attrs={attribute: value})
            if tag and tag.get("content"):
                candidate = urljoin(response.url, tag["content"].strip())
                if "googleusercontent.com" not in candidate:
                    image_url = candidate
                    break

        description = None
        for attribute, value in [
            ("property", "og:description"),
            ("name", "description"),
            ("name", "twitter:description"),
        ]:
            tag = soup.find("meta", attrs={attribute: value})
            if tag and tag.get("content"):
                text = re.sub(r"\s+", " ", tag["content"]).strip()
                if len(text) >= 60:
                    description = text
                    break

        paragraphs = []
        for paragraph in soup.find_all("p"):
            text = re.sub(r"\s+", " ", paragraph.get_text(" ", strip=True)).strip()

            if len(text) < 80:
                continue

            lowered = text.lower()
            if any(
                marker in lowered
                for marker in [
                    "subscribe",
                    "newsletter",
                    "advertisement",
                    "read more",
                    "follow us",
                    "cookies",
                    "privacy policy",
                ]
            ):
                continue

            if text not in paragraphs:
                paragraphs.append(text)

            if len(paragraphs) >= 8:
                break

        key_points = []
        for paragraph in paragraphs:
            sentences = re.split(r"(?<=[.!?])\s+", paragraph)

            for sentence in sentences:
                sentence = sentence.strip()

                if 70 <= len(sentence) <= 260 and sentence not in key_points:
                    key_points.append(sentence)

                if len(key_points) >= 4:
                    break

            if len(key_points) >= 4:
                break

        article_summary = description
        if not article_summary and paragraphs:
            article_summary = paragraphs[0][:500]

        return {
            "image_url": image_url,
            "article_summary": article_summary,
            "key_points": key_points,
        }

    except Exception as error:
        print("Publisher article fetch failed:", article_url, error)
        return fallback


def decode_google_links(urls):
    if not urls:
        return []

    try:
        decoded = asyncio.run(
            gnews_decoder_async(
                urls,
                interval=None,
                proxy=None,
                timeout=8.0,
                concurrency=8,
            )
        )

        if not isinstance(decoded, list):
            decoded = [decoded]

        resolved = []
        for original, result in zip(urls, decoded):
            if isinstance(result, dict) and result.get("success"):
                resolved.append(result.get("decoded_url") or original)
            else:
                resolved.append(original)

        while len(resolved) < len(urls):
            resolved.append(urls[len(resolved)])

        return resolved
    except Exception as error:
        print("Google News URL decode failed:", error)
        return urls


def infer_category(title: str) -> str:
    text = title.lower()

    category_rules = [
        ("Sports", ["cricket", "football", "ipl", "fifa", "wwe", "tennis", "match", "world cup"]),
        ("Technology", ["apple", "iphone", "android", "microsoft", "google", "openai", " ai ", "chip", "tesla", "robot", "software", "tech"]),
        ("Entertainment", ["movie", "film", "actor", "actress", "bollywood", "hollywood", "netflix", "trailer", "music", "series"]),
        ("Gaming", ["gaming", "game ", "playstation", "xbox", "nintendo", "steam", "esports"]),
        ("Business", ["market", "stocks", "shares", "bank", "economy", "trade", "company", "revenue", "funding", "fta"]),
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
    feed_url = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    feed = feedparser.parse(feed_url)

    if not feed.entries:
        print("Google News RSS failed or returned empty.")
        return None

    entries = list(feed.entries[:16])
    wrapped_urls = [entry.link for entry in entries]
    publisher_urls = decode_google_links(wrapped_urls)

    results = []

    for index, (entry, publisher_url) in enumerate(
        zip(entries, publisher_urls),
        start=1,
    ):
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

        article_brief = extract_article_brief(publisher_url)
        image_url = (
            extract_feed_image(entry)
            or article_brief["image_url"]
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
                "summary": article_brief["article_summary"]
                or create_human_gist(title, getattr(entry, "summary", "")),
                "article_summary": article_brief["article_summary"],
                "key_points": article_brief["key_points"],
                "public_reactions": youtube_data.get("reactions", []),
                "score_breakdown": scoring["score_breakdown"],
                "platform_metrics": {
                    "news": news_score * 1000,
                    "youtube": youtube_for_score,
                    "x": int(news_score * 850),
                    "instagram": int(news_score * 540),
                },
                "source": extract_source(entry),
                "link": publisher_url,
                "image_url": image_url,
            }
        )

    return results
