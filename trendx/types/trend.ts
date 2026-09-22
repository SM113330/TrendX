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
  article_summary?: string | null;
  key_points?: string[];
  youtube_video?: {
    video_id: string;
    title: string;
    channel_title: string;
    thumbnail?: string | null;
    url: string;
    embed_url: string;
    views: number;
    likes: number;
    comments: number;
    published_at?: string | null;
  } | null;
  youtube_videos?: Array<{
    video_id: string;
    title: string;
    channel_title: string;
    thumbnail?: string | null;
    url: string;
    embed_url: string;
    views: number;
    likes: number;
    comments: number;
    published_at?: string | null;
  }>;
  public_reactions?: Array<{
    platform: string;
    author: string;
    avatar_url?: string | null;
    text: string;
    likes: number;
    published_at?: string | null;
    video_title?: string | null;
    url?: string | null;
  }>;
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