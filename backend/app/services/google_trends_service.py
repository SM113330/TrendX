import asyncio
import html
import json
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

STOPWORDS = {
    "the", "a", "an", "to", "of", "in", "on", "for", "and", "or", "is", "are",
    "was", "were", "with", "from", "at", "by", "after", "over", "into", "as",
    "its", "this", "that", "it", "be", "will", "has", "have", "had", "says",
}

BOILERPLATE_MARKERS = [
    "this live blog",
    "live blog is",
    "rolling curation",
    "updates added as events unfold",
    "news agenda changes",
    "subscribe",
    "subscription",
    "premium stories",
    "premium article",
    "premium access",
    "newsletter",
    "advertisement",
    "advertising",
    "read more",
    "follow us",
    "cookies",
    "privacy policy",
    "terms of use",
    "terms and conditions",
    "sign in",
    "log in",
    "register",
    "account",
    "membership",
    "exclusive access",
    "download the app",
    "app store",
    "google play",
    "editorials",
    "opinions and more",
    "books of the week",
    "health matters",
    "recommended for you",
    "related stories",
    "also read",
    "most popular",
    "trending stories",
    "copyright",
]


def create_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def clean_summary(raw_summary: str) -> str:
    if not raw_summary:
        return ""

    soup = BeautifulSoup(raw_summary, "html.parser")
    text = soup.get_text(" ", strip=True)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


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


def is_boilerplate(text: str) -> bool:
    lowered = text.lower()
    return any(marker in lowered for marker in BOILERPLATE_MARKERS)


def title_keywords(title: str):
    return {
        word
        for word in re.findall(r"[a-z0-9]+", title.lower())
        if len(word) > 2 and word not in STOPWORDS
    }


def core_title_keywords(title: str):
    lowered = title.lower()
    parts = re.split(
        r"\s+(?:in|amid|during|following)\s+",
        lowered,
        maxsplit=1,
    )
    core = parts[0]

    return {
        word
        for word in re.findall(r"[a-z0-9]+", core)
        if len(word) > 2 and word not in STOPWORDS
    }


def normalized_tokens(text: str):
    return {
        word
        for word in re.findall(r"[a-z0-9]+", text.lower())
        if len(word) > 2 and word not in STOPWORDS
    }


def near_duplicate(left: str, right: str) -> bool:
    left_tokens = normalized_tokens(left)
    right_tokens = normalized_tokens(right)

    if not left_tokens or not right_tokens:
        return False

    intersection = len(left_tokens & right_tokens)
    union = len(left_tokens | right_tokens)

    if union == 0:
        return False

    jaccard = intersection / union
    containment = intersection / min(len(left_tokens), len(right_tokens))

    return jaccard >= 0.62 or containment >= 0.78


def sentence_score(sentence: str, keywords) -> float:
    lowered = sentence.lower()
    words = set(re.findall(r"[a-z0-9]+", lowered))
    overlap = len(words & keywords)
    length_bonus = min(len(sentence), 220) / 220
    return overlap * 2.5 + length_bonus


def extract_jsonld_article_body(soup: BeautifulSoup):
    bodies = []

    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = script.string or script.get_text()
        if not raw:
            continue

        try:
            parsed = json.loads(raw)
        except Exception:
            continue

        stack = parsed if isinstance(parsed, list) else [parsed]

        while stack:
            item = stack.pop()

            if isinstance(item, list):
                stack.extend(item)
                continue

            if not isinstance(item, dict):
                continue

            body = item.get("articleBody")
            if isinstance(body, str) and len(body) > 120:
                bodies.append(body)

            for value in item.values():
                if isinstance(value, (dict, list)):
                    stack.append(value)

    return bodies


def collect_article_paragraphs(soup: BeautifulSoup):
    paragraphs = []

    containers = []
    article = soup.find("article")
    main = soup.find("main")

    if article:
        containers.append(article)
    if main and main is not article:
        containers.append(main)

    if not containers:
        containers = [soup]

    for container in containers:
        for paragraph in container.find_all("p"):
            text = re.sub(r"\s+", " ", paragraph.get_text(" ", strip=True)).strip()

            if len(text) < 70 or len(text) > 1200:
                continue
            if is_boilerplate(text):
                continue
            if text not in paragraphs:
                paragraphs.append(text)

            if len(paragraphs) >= 18:
                return paragraphs

    return paragraphs


def extract_article_brief(article_url: str, title: str):
    fallback = {
        "image_url": None,
        "article_summary": None,
        "key_points": [],
        "quality": 0,
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
        keywords = title_keywords(title)
        core_keywords = core_title_keywords(title)

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
            if not tag or not tag.get("content"):
                continue

            text = re.sub(r"\s+", " ", tag["content"]).strip()
            if (
                80 <= len(text) <= 700
                and not is_boilerplate(text)
                and sentence_score(text, keywords) >= 1.0
            ):
                description = text
                break

        raw_bodies = extract_jsonld_article_body(soup)
        paragraphs = []

        for body in raw_bodies:
            for paragraph in re.split(r"\n{1,}|(?<=[.!?])\s+(?=[A-Z])", body):
                paragraph = re.sub(r"\s+", " ", paragraph).strip()
                if 70 <= len(paragraph) <= 1200 and not is_boilerplate(paragraph):
                    paragraphs.append(paragraph)

        paragraphs.extend(
            p for p in collect_article_paragraphs(soup) if p not in paragraphs
        )

        sentences = []
        for paragraph in paragraphs:
            for sentence in re.split(r"(?<=[.!?])\s+", paragraph):
                sentence = sentence.strip()
                if not 70 <= len(sentence) <= 320:
                    continue
                if is_boilerplate(sentence):
                    continue
                if sentence not in sentences:
                    sentences.append(sentence)

        eligible = []

        for position, sentence in enumerate(sentences):
            sentence_tokens = normalized_tokens(sentence)
            title_overlap = len(sentence_tokens & keywords)
            core_overlap = len(sentence_tokens & core_keywords)

            if title_overlap < 2:
                continue

            # A sentence should connect to the event itself, not merely reuse
            # location/context words appearing later in the headline.
            if core_keywords and core_overlap == 0:
                continue

            score = sentence_score(sentence, keywords)
            score += core_overlap * 2.0
            score -= position * 0.015

            eligible.append((score, position, sentence))

        ranked_items = sorted(
            eligible,
            key=lambda item: (-item[0], item[1]),
        )

        key_points = []
        for _, _, sentence in ranked_items:
            if any(near_duplicate(sentence, existing) for existing in key_points):
                continue

            key_points.append(sentence)

            if len(key_points) >= 4:
                break

        ranked = [item[2] for item in ranked_items]

        article_summary = description

        if not article_summary and ranked:
            chosen = ranked[:2]
            article_summary = " ".join(chosen)
            if len(article_summary) > 620:
                article_summary = article_summary[:617].rsplit(" ", 1)[0] + "…"

        quality = 0
        if article_summary:
            quality += 2
        quality += min(len(key_points), 4)

        return {
            "image_url": image_url,
            "article_summary": article_summary,
            "key_points": key_points,
            "quality": quality,
        }

    except Exception as error:
        print("Publisher article fetch failed:", article_url, error)
        return fallback


def extract_related_google_links(raw_summary: str):
    if not raw_summary:
        return []

    soup = BeautifulSoup(raw_summary, "html.parser")
    links = []

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if "news.google.com" in href and href not in links:
            links.append(href)
        if len(links) >= 5:
            break

    return links


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


def build_fallback_summary(title: str, source: str):
    return (
        f"{source} is reporting that {title.rstrip('.')}. "
        "TRENDX is tracking the story because it is receiving strong coverage across multiple current news sources."
    )


def infer_category(title: str) -> str:
    text = f" {title.lower()} "

    category_rules = [
        ("Sports", [" cricket ", " football ", " ipl ", " fifa ", " wwe ", " tennis ", " match ", " world cup "]),
        ("Technology", [" apple ", " iphone ", " android ", " microsoft ", " google ", " openai ", " ai ", " chip ", " tesla ", " robot ", " software ", " tech "]),
        ("Entertainment", [" movie ", " film ", " actor ", " actress ", " bollywood ", " hollywood ", " netflix ", " trailer ", " music ", " series "]),
        ("Gaming", [" gaming ", " game ", " playstation ", " xbox ", " nintendo ", " steam ", " esports "]),
        ("Business", [" market ", " stocks ", " shares ", " bank ", " economy ", " trade ", " company ", " revenue ", " funding ", " fta "]),
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
        source = extract_source(entry)
        raw_summary = getattr(entry, "summary", "")

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

        candidate_urls = [publisher_url]
        related_wrapped = extract_related_google_links(raw_summary)
        related_decoded = decode_google_links(related_wrapped[:3])

        for url in related_decoded:
            if url not in candidate_urls:
                candidate_urls.append(url)

        best_brief = {
            "image_url": None,
            "article_summary": None,
            "key_points": [],
            "quality": 0,
        }

        chosen_url = publisher_url

        for candidate_url in candidate_urls[:4]:
            brief = extract_article_brief(candidate_url, title)

            if brief["quality"] > best_brief["quality"]:
                best_brief = brief
                chosen_url = candidate_url

            if brief["quality"] >= 5:
                break

        image_url = (
            best_brief["image_url"]
            or extract_feed_image(entry)
            or youtube_thumbnail
        )

        summary = best_brief["article_summary"] or build_fallback_summary(title, source)

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
                "summary": summary,
                "article_summary": best_brief["article_summary"],
                "key_points": best_brief["key_points"],
                "public_reactions": youtube_data.get("reactions", []),
                "score_breakdown": scoring["score_breakdown"],
                "platform_metrics": {
                    "news": news_score * 1000,
                    "youtube": youtube_for_score,
                    "x": int(news_score * 850),
                    "instagram": int(news_score * 540),
                },
                "source": source,
                "link": chosen_url,
                "image_url": image_url,
            }
        )

    return results
