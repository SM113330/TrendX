def generate_analysis(title, score, source):
    if score >= 85:
        strength = "very strong"
    elif score >= 65:
        strength = "strong"
    else:
        strength = "moderate"

    return (
        f"{title} is currently showing {strength} momentum across Indian media. "
        f"The story is being amplified by coverage from {source} and other publishers. "
        f"The volume of reporting suggests increasing public attention and continued discussion. "
        f"If this coverage trend persists, the topic may remain among the dominant news conversations over the coming news cycle."
    )