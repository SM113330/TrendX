import { trendingData } from "@/lib/constants";
import { Trend } from "@/types/trend";
import { calculateDirection, calculateTrendScore } from "@/lib/scoreEngine";

const API_URL = "http://localhost:8000";
export async function getBackendTrends(): Promise<Trend[]> {
  const response = await fetch(`${API_URL}/api/trends`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend trends");
  }

  return response.json();
}
export async function getBackendTrend(slug: string): Promise<Trend> {
  const response = await fetch(`${API_URL}/api/trend/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend trend");
  }

  return response.json();
}
export async function searchBackendTrends(query: string) {
  const response = await fetch(
    `${API_URL}/api/search?q=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search backend trends");
  }

  return response.json();
}
export async function compareBackendTrends(
  leftSlug: string,
  rightSlug: string
) {
  const response = await fetch(
    `${API_URL}/api/compare/${leftSlug}/${rightSlug}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to compare backend trends");
  }

  return response.json();
}
export async function getBackendCreator(slug: string) {
  const response = await fetch(`${API_URL}/api/creator/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend creator");
  }

  return response.json();
}
export async function getBackendRegion(slug: string) {
  const response = await fetch(`${API_URL}/api/region/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch backend region");
  }

  return response.json();
}

export async function getTrends() {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return trendingData;
}

export function getLiveEngagement() {
  return {
    x: Math.floor(120000 + Math.random() * 15000),
    facebook: Math.floor(90000 + Math.random() * 12000),
    instagram: Math.floor(65000 + Math.random() * 9000),
  };
}

export function getTrendingNow() {
  return [
    ["#Furiosa", `${Math.floor(120 + Math.random() * 15)}K`],
    ["#iPhone16Pro", `${Math.floor(105 + Math.random() * 12)}K`],
    ["#WWERaw", `${Math.floor(85 + Math.random() * 10)}K`],
    ["#ElonMusk", `${Math.floor(70 + Math.random() * 8)}K`],
    ["#InsideOut2", `${Math.floor(50 + Math.random() * 7)}K`],
  ];
}

function createTrend(
  id: number,
  title: string,
  category: string,
  baseEngagement: number,
  engagementRange: number,
  minVelocity: number,
  velocityRange: number,
  minSentiment: number,
  sentimentRange: number
): Trend {
  const engagement = Math.floor(
    baseEngagement + Math.random() * engagementRange
  );

  const velocity = Math.floor(
    minVelocity + Math.random() * velocityRange
  );

  const sentiment = Math.floor(
    minSentiment + Math.random() * sentimentRange
  );

  const direction = calculateDirection({
    velocity,
    sentiment,
  });

  const score = calculateTrendScore({
    engagement,
    velocity,
    sentiment,
  });

  return {
    id,
    title,
    category,
    engagement,
    velocity,
    sentiment,
    direction,
    score,
  };
}

export function getLiveTrendFeed(): Trend[] {
  const pool: Trend[] = [
    createTrend(1, "Furiosa", "Movies", 120000, 20000, 70, 30, 65, 30),
    createTrend(2, "iPhone 16 Pro", "Tech", 100000, 18000, 60, 35, 70, 25),
    createTrend(3, "WWERaw", "Sports", 85000, 16000, 45, 35, 45, 30),
    createTrend(4, "Tesla Robotaxi", "Tech", 70000, 22000, 50, 45, 40, 35),
    createTrend(5, "OpenAI Sora", "AI", 90000, 30000, 75, 25, 70, 25),
    createTrend(6, "Inside Out 2", "Movies", 76000, 18000, 50, 35, 65, 25),
    createTrend(7, "Crypto Market", "Finance", 68000, 24000, 35, 45, 35, 40),
  ];

  return pool.sort((a, b) => b.velocity - a.velocity).slice(0, 3);
}