export function normalize(value: number, max: number) {
  return Math.min(value / max, 1) * 100;
}

export function calculateTrendScore({
  engagement,
  velocity,
  sentiment,
}: {
  engagement: number;
  velocity: number;
  sentiment: number;
}) {
  const engagementScore = normalize(engagement, 150000);

  const score =
    engagementScore * 0.4 +
    velocity * 0.35 +
    sentiment * 0.25;

  return Math.round(score);
}

export function calculateDirection({
  velocity,
  sentiment,
}: {
  velocity: number;
  sentiment: number;
}) {
  if (velocity >= 88 && sentiment >= 75) return "rocket";
  if (velocity >= 65 && sentiment >= 55) return "up";
  return "down";
}