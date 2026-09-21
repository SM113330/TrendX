export interface Trend {
  id: number;

  title: string;
  slug?: string;

  category: string;
  image_url?: string | null;

  engagement: number;
  velocity: number;
  sentiment: number;

  score: number;

  direction: "rocket" | "up" | "down";

  momentum?: number[];

  summary?: string;
  analysis?: string;

  source?: string;
  link?: string;

  score_breakdown?: {
    source_coverage?: number;
    momentum_strength?: number;
    media_velocity?: number;
    public_engagement?: number;
  };

  platform_metrics?: {
    news?: number;
    youtube?: number;
    x?: number;
    instagram?: number;
  };
}