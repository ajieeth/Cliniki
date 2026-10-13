# Clinic Caller

Clinic operations app for doctor availability, patient enquiries, AI-assisted voice conversations, and automatic appointment booking.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/clinic-caller run dev` — run the web app through its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `ELEVENLABS_API_KEY` — assistant speech synthesis

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract and generated-hook source
- `lib/db/src/schema/clinic.ts` — doctors, slots, appointments, enquiries, and voice calls
- `artifacts/api-server/src/routes/clinic.ts` — booking and voice workflow
- `artifacts/clinic-caller/src/pages/` — clinic dashboard pages
- `artifacts/clinic-caller/src/index.css` — visual tokens and theme

## Architecture decisions

- The API contract is defined first in OpenAPI; frontend hooks and server validators are generated from it.
- Appointment booking and slot reservation happen in one database transaction.
- ElevenLabs is called only from the API server so its key is never exposed to the browser.
- Calendar dates are stored as date-only strings to avoid timezone shifts.

## Product

- Dashboard with clinic activity, appointments, doctors, AI-call metrics, and booking rate
- Doctor and availability-slot management
- Manual appointment booking and appointment status updates
- Patient enquiry tracking
- AI call workspace with transcript, suggested slots, automatic booking, and ElevenLabs speech

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Re-run API codegen after every OpenAPI change before editing clients or route validators.
- Telephone deployment still needs an ElevenLabs Conversational AI agent and assigned phone number; the current app provides the web call workspace and ElevenLabs speech.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
