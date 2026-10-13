import { Router, type IRouter } from "express";
import {
  GetSarvamSignedUrlParams,
  GetSarvamSignedUrlResponse,
} from "@workspace/api-zod";
import {
  SARVAM_API_BASE,
  SARVAM_APP_ID,
  SARVAM_ORG_ID,
  SARVAM_WORKSPACE_ID,
} from "../lib/sarvam";

const router: IRouter = Router();

router.get(
  "/sarvam/orgs/:orgId/workspaces/:workspaceId/apps/:appId/url",
  async (req, res): Promise<void> => {
    const params = GetSarvamSignedUrlParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    if (
      params.data.orgId !== SARVAM_ORG_ID ||
      params.data.workspaceId !== SARVAM_WORKSPACE_ID ||
      params.data.appId !== SARVAM_APP_ID
    ) {
      res.status(404).json({ error: "Sarvam voice agent not found" });
      return;
    }

    const apiKey = process.env.SARVAM_VOICE_AGENTS_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "Sarvam Voice Agents is not configured" });
      return;
    }

    const providerUrl = new URL(
      `${SARVAM_API_BASE}/app-runtime/orgs/${encodeURIComponent(params.data.orgId)}/workspaces/${encodeURIComponent(params.data.workspaceId)}/apps/${encodeURIComponent(params.data.appId)}/url`,
    );
    providerUrl.searchParams.set("interaction_type", "call");

    const requestedVersion =
      typeof req.query.version === "string" ? req.query.version : undefined;
    if (requestedVersion && /^\d+$/.test(requestedVersion)) {
      providerUrl.searchParams.set("version", requestedVersion);
    }

    try {
      const response = await fetch(providerUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        const detail = await response.text();
        req.log.error(
          {
            provider: "sarvam",
            status: response.status,
            detail: detail.slice(0, 300),
          },
          "Sarvam signed URL request failed",
        );
        res
          .status(response.status)
          .json({ error: "Unable to start the Sarvam voice session" });
        return;
      }

      const payload: unknown = await response.json();
      res.json(GetSarvamSignedUrlResponse.parse(payload));
    } catch (error) {
      req.log.error({ err: error, provider: "sarvam" }, "Sarvam request failed");
      res.status(502).json({ error: "Sarvam Voice Agents is unavailable" });
    }
  },
);

export default router;