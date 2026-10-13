export const SARVAM_API_BASE = "https://apps.sarvam.ai/api";
export const SARVAM_ORG_ID = "019e90d5-be96-7e52-be4a-8ed82cdebbc2";
export const SARVAM_WORKSPACE_ID = "019e90d5-becc-7368-93fb-b4856f7600bb";
export const SARVAM_APP_ID = "Conversatio-471ae44b-2867";
export const SARVAM_RATE_PER_MINUTE_INR = 4.5;
const INDIA_TIME_OFFSET_MS = 330 * 60 * 1000;

type SarvamInteraction = {
  duration_in_seconds?: number | null;
};

type SarvamInteractionsPage = {
  items: SarvamInteraction[];
  total: number;
  limit: number;
  offset: number;
};

export type SarvamVoiceUsage = {
  status: "available" | "unavailable";
  calls: number | null;
  minutes: number | null;
  estimatedCostInr: number | null;
  ratePerMinuteInr: number;
};

function parseInteractionsPage(payload: unknown): SarvamInteractionsPage {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as { items?: unknown }).items) ||
    typeof (payload as { total?: unknown }).total !== "number" ||
    typeof (payload as { limit?: unknown }).limit !== "number" ||
    typeof (payload as { offset?: unknown }).offset !== "number"
  ) {
    throw new Error("Sarvam returned an invalid interactions response");
  }

  return payload as SarvamInteractionsPage;
}

export async function getSarvamDailyVoiceUsage(): Promise<SarvamVoiceUsage> {
  const apiKey = process.env.SARVAM_VOICE_AGENTS_API_KEY;
  if (!apiKey) {
    throw new Error("Sarvam Voice Agents is not configured");
  }

  const now = new Date();
  const nowInIndia = new Date(now.getTime() + INDIA_TIME_OFFSET_MS);
  const startOfDay = new Date(
    Date.UTC(
      nowInIndia.getUTCFullYear(),
      nowInIndia.getUTCMonth(),
      nowInIndia.getUTCDate(),
    ) - INDIA_TIME_OFFSET_MS,
  );
  const limit = 100;
  let offset = 0;
  let total = 0;
  let durationInSeconds = 0;

  do {
    const url = new URL(
      `${SARVAM_API_BASE}/analytics/v1/${encodeURIComponent(SARVAM_ORG_ID)}/${encodeURIComponent(SARVAM_WORKSPACE_ID)}/${encodeURIComponent(SARVAM_APP_ID)}/interactions`,
    );
    url.searchParams.set("start_datetime", startOfDay.toISOString());
    url.searchParams.set("end_datetime", now.toISOString());
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Sarvam analytics request failed with ${response.status}`);
    }

    const page = parseInteractionsPage(await response.json());
    total = page.total;
    durationInSeconds += page.items.reduce((sum, interaction) => {
      const duration = interaction.duration_in_seconds;
      return sum + (typeof duration === "number" && duration > 0 ? duration : 0);
    }, 0);
    offset += page.items.length;

    if (page.items.length === 0) break;
  } while (offset < total);

  const minutes = durationInSeconds / 60;

  return {
    status: "available",
    calls: total,
    minutes: Math.round(minutes * 100) / 100,
    estimatedCostInr:
      Math.round(minutes * SARVAM_RATE_PER_MINUTE_INR * 100) / 100,
    ratePerMinuteInr: SARVAM_RATE_PER_MINUTE_INR,
  };
}

export function unavailableSarvamVoiceUsage(): SarvamVoiceUsage {
  return {
    status: "unavailable",
    calls: null,
    minutes: null,
    estimatedCostInr: null,
    ratePerMinuteInr: SARVAM_RATE_PER_MINUTE_INR,
  };
}