def clamp(value: int, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(value, maximum))


def calculate_trend_score(
    news_score: int,
    momentum_score: int,
    youtube_signal: int,
    velocity_score: int,
):
    youtube_score = clamp(int(youtube_signal / 2500))

    news_component = int(news_score * 0.35)
    momentum_component = int(momentum_score * 0.25)
    youtube_component = int(youtube_score * 0.25)
    velocity_component = int(velocity_score * 0.15)

    total_score = clamp(
        news_component
        + momentum_component
        + youtube_component
        + velocity_component
    )

    return {
        "score": total_score,
        "score_breakdown": {
            "news_coverage": news_component,
            "momentum_strength": momentum_component,
            "youtube_strength": youtube_component,
            "media_velocity": velocity_component,
        },
    }