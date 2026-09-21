import re
import html
import feedparser

from app.services.analyst_service import generate_analysis
from app.services.youtube_service import fetch_youtube_data
from app.services.scoring_service import calculate_trend_score



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
    return (
        f"{title} is gaining significant attention across Indian news platforms. "
        f"Multiple publishers are reporting on this topic, which suggests that the story is moving beyond a single-source update. "
        f"The trend appears to be driven by public reaction, political discussion, and fast-moving media coverage. "
        f"TRENDX currently identifies this as a high-momentum live news trend."
    )


def extract_source(entry) -> str:
    try:
        return entry.get("source", {}).get("title", "Google News")
    except Exception:
        return "Google News"


def extract_image_url(entry):
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
                link_type = link.get("type", "")
                if link_type.startswith("image"):
                    return link.get("href")

        if "links" in entry and entry.links:
            for link in entry.links:
                link_type = link.get("type", "")
                if link_type.startswith("image"):
                    return link.get("href")

    except Exception:
        return None

    return None


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

    for index, entry in enumerate(feed.entries[:10], start=1):
        title = entry.title.split(" - ")[0].strip()

        news_score = max(100 - index * 7, 35)
        velocity = news_score
        sentiment = 75
        direction = calculate_direction(news_score)

        youtube_data = fetch_youtube_data(title)
        youtube_signal = youtube_data["signal"]
        youtube_thumbnail = youtube_data["thumbnail"]
        youtube_for_score = (
            youtube_signal if youtube_signal > 0 else int(news_score * 620)
        )

        scoring = calculate_trend_score(
            news_score=news_score,
            momentum_score=news_score,
            youtube_signal=youtube_for_score,
            velocity_score=news_score,
        )

        results.append(
            {
                "id": index,
                "title": title,
                "slug": create_slug(title),
                "category": "Live News",
                "engagement": news_score * 1000,
                "velocity": velocity,
                "sentiment": sentiment,
                "score": scoring["score"],
                "direction": direction,
                "momentum": create_momentum(news_score),
                "summary": create_human_gist(
                    title,
                    getattr(entry, "summary", ""),
                ),
                "analysis": generate_analysis(
                    title,
                    scoring["score"],
                    extract_source(entry),
                ),
                "score_breakdown": scoring["score_breakdown"],
                "platform_metrics": {
                    "news": news_score * 1000,
                    "youtube": youtube_for_score,
                    "x": int(news_score * 850),
                    "instagram": int(news_score * 540),
                },
                "source": extract_source(entry),
                "link": entry.link,
                "image_url": extract_image_url(entry) or youtube_thumbnail,
            }
        )

    return results