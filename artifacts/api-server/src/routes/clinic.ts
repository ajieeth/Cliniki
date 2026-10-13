import { Router, type IRouter } from "express";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  sql,
} from "drizzle-orm";
import {
  appointmentsTable,
  db,
  doctorsTable,
  enquiriesTable,
  slotsTable,
  voiceCallsTable,
  type TranscriptMessage,
} from "@workspace/db";
import {
  CreateAppointmentBody,
  CreateAppointmentResponse,
  CreateDoctorBody,
  CreateDoctorResponse,
  CreateEnquiryBody,
  CreateEnquiryResponse,
  CreateSlotBody,
  CreateSlotResponse,
  GetDashboardSummaryResponse,
  ListAppointmentsQueryParams,
  ListAppointmentsResponse,
  ListDoctorsResponse,
  ListEnquiriesResponse,
  ListSlotsQueryParams,
  ListSlotsResponse,
  ProcessVoiceTurnBody,
  ProcessVoiceTurnParams,
  ProcessVoiceTurnResponse,
  StartVoiceCallBody,
  StartVoiceCallResponse,
  SynthesizeSpeechBody,
  SynthesizeSpeechResponse,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";
import {
  getSarvamDailyVoiceUsage,
  unavailableSarvamVoiceUsage,
} from "../lib/sarvam";

const router: IRouter = Router();

const palette = ["#2F7D6B", "#5B6ABF", "#C2764B", "#8A5D9E", "#397A9E"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

async function appointmentRows(status?: string) {
  const conditions = status ? eq(appointmentsTable.status, status) : undefined;
  return db
    .select({
      id: appointmentsTable.id,
      patientName: appointmentsTable.patientName,
      patientPhone: appointmentsTable.patientPhone,
      doctorId: appointmentsTable.doctorId,
      doctorName: doctorsTable.name,
      specialty: doctorsTable.specialty,
      date: appointmentsTable.date,
      time: appointmentsTable.time,
      reason: appointmentsTable.reason,
      status: appointmentsTable.status,
      source: appointmentsTable.source,
      createdAt: appointmentsTable.createdAt,
    })
    .from(appointmentsTable)
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(conditions)
    .orderBy(desc(appointmentsTable.date), asc(appointmentsTable.time));
}

async function availableSlotRows(limit?: number) {
  const query = db
    .select({
      id: slotsTable.id,
      doctorId: slotsTable.doctorId,
      doctorName: doctorsTable.name,
      date: slotsTable.date,
      time: slotsTable.time,
      durationMinutes: slotsTable.durationMinutes,
      status: slotsTable.status,
    })
    .from(slotsTable)
    .innerJoin(doctorsTable, eq(slotsTable.doctorId, doctorsTable.id))
    .where(
      and(
        eq(slotsTable.status, "available"),
        gte(slotsTable.date, new Date().toISOString().slice(0, 10)),
      ),
    )
    .orderBy(asc(slotsTable.date), asc(slotsTable.time));

  return limit ? query.limit(limit) : query;
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const [
    [{ value: appointmentsToday }],
    [{ value: availableSlots }],
    [{ value: activeDoctors }],
    [{ value: aiCallsToday }],
    [{ value: totalCalls }],
    [{ value: bookedCalls }],
    sarvamVoiceUsage,
    upcomingAppointments,
    recentEnquiries,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.date, today)),
    db
      .select({ value: count() })
      .from(slotsTable)
      .where(eq(slotsTable.status, "available")),
    db
      .select({ value: count() })
      .from(doctorsTable)
      .where(eq(doctorsTable.active, true)),
    db
      .select({ value: count() })
      .from(voiceCallsTable)
      .where(sql`${voiceCallsTable.createdAt}::date = CURRENT_DATE`),
    db.select({ value: count() }).from(voiceCallsTable),
    db
      .select({ value: count() })
      .from(voiceCallsTable)
      .where(eq(voiceCallsTable.status, "booked")),
    getSarvamDailyVoiceUsage().catch((error: unknown) => {
      req.log.warn(
        { err: error, provider: "sarvam" },
        "Sarvam voice usage is unavailable",
      );
      return unavailableSarvamVoiceUsage();
    }),
    db
      .select({
        id: appointmentsTable.id,
        patientName: appointmentsTable.patientName,
        patientPhone: appointmentsTable.patientPhone,
        doctorId: appointmentsTable.doctorId,
        doctorName: doctorsTable.name,
        specialty: doctorsTable.specialty,
        date: appointmentsTable.date,
        time: appointmentsTable.time,
        reason: appointmentsTable.reason,
        status: appointmentsTable.status,
        source: appointmentsTable.source,
        createdAt: appointmentsTable.createdAt,
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(gte(appointmentsTable.date, today))
      .orderBy(asc(appointmentsTable.date), asc(appointmentsTable.time))
      .limit(4),
    db
      .select()
      .from(enquiriesTable)
      .orderBy(desc(enquiriesTable.createdAt))
      .limit(4),
  ]);

  const recentActivity = recentEnquiries.map((enquiry) => ({
    id: enquiry.id,
    title:
      enquiry.status === "booked"
        ? "Appointment booked"
        : "New patient enquiry",
    detail: `${enquiry.patientName} · ${enquiry.summary}`,
    time: enquiry.createdAt.toISOString(),
    type: enquiry.status === "booked" ? "booking" : "enquiry",
  }));

  res.json(
    GetDashboardSummaryResponse.parse({
      appointmentsToday,
      availableSlots,
      activeDoctors,
      aiCallsToday,
      bookingRate: totalCalls ? Math.round((bookedCalls / totalCalls) * 100) : 0,
      sarvamVoiceUsage,
      upcomingAppointments,
      recentActivity,
    }),
  );
});

router.get("/doctors", async (_req, res): Promise<void> => {
  const doctors = await db
    .select()
    .from(doctorsTable)
    .orderBy(asc(doctorsTable.name));
  res.json(ListDoctorsResponse.parse(doctors));
});

router.post("/doctors", async (req, res): Promise<void> => {
  const parsed = CreateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ value: doctorCount }] = await db
    .select({ value: count() })
    .from(doctorsTable);
  const [doctor] = await db
    .insert(doctorsTable)
    .values({
      ...parsed.data,
      initials: initials(parsed.data.name),
      color: palette[doctorCount % palette.length] ?? palette[0],
    })
    .returning();
  res.status(201).json(CreateDoctorResponse.parse(doctor));
});

router.get("/slots", async (req, res): Promise<void> => {
  const parsed = ListSlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const conditions = [
    parsed.data.date
      ? eq(slotsTable.date, parsed.data.date)
      : undefined,
    parsed.data.doctorId
      ? eq(slotsTable.doctorId, parsed.data.doctorId)
      : undefined,
  ].filter(Boolean);
  const slots = await db
    .select({
      id: slotsTable.id,
      doctorId: slotsTable.doctorId,
      doctorName: doctorsTable.name,
      date: slotsTable.date,
      time: slotsTable.time,
      durationMinutes: slotsTable.durationMinutes,
      status: slotsTable.status,
    })
    .from(slotsTable)
    .innerJoin(doctorsTable, eq(slotsTable.doctorId, doctorsTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(slotsTable.date), asc(slotsTable.time));
  res.json(ListSlotsResponse.parse(slots));
});

router.post("/slots", async (req, res): Promise<void> => {
  const parsed = CreateSlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, parsed.data.doctorId));
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  const [slot] = await db
    .insert(slotsTable)
    .values({
      ...parsed.data,
      date: toDateString(parsed.data.date),
      durationMinutes: parsed.data.durationMinutes ?? 30,
    })
    .returning();
  res.status(201).json(
    CreateSlotResponse.parse({ ...slot, doctorName: doctor.name }),
  );
});

router.get("/appointments", async (req, res): Promise<void> => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(
    ListAppointmentsResponse.parse(
      await appointmentRows(parsed.data.status),
    ),
  );
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, parsed.data.doctorId));
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  const date = toDateString(parsed.data.date);
  const [slot] = await db
    .select()
    .from(slotsTable)
    .where(
      and(
        eq(slotsTable.doctorId, parsed.data.doctorId),
        eq(slotsTable.date, date),
        eq(slotsTable.time, parsed.data.time),
        eq(slotsTable.status, "available"),
      ),
    );
  const [appointment] = await db.transaction(async (tx) => {
    const created = await tx
      .insert(appointmentsTable)
      .values({
        ...parsed.data,
        date,
        reason: parsed.data.reason ?? null,
        slotId: slot?.id ?? null,
      })
      .returning();
    if (slot) {
      await tx
        .update(slotsTable)
        .set({ status: "booked" })
        .where(eq(slotsTable.id, slot.id));
    }
    return created;
  });
  res.status(201).json(
    CreateAppointmentResponse.parse({
      ...appointment,
      doctorName: doctor.name,
      specialty: doctor.specialty,
    }),
  );
});

router.patch("/appointments/:id/status", async (req, res): Promise<void> => {
  const params = UpdateAppointmentStatusParams.safeParse(req.params);
  const body = UpdateAppointmentStatusBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: body.data.status })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (appointment.slotId) {
    await db
      .update(slotsTable)
      .set({
        status: body.data.status === "cancelled" ? "available" : "booked",
      })
      .where(eq(slotsTable.id, appointment.slotId));
  }
  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, appointment.doctorId));
  res.json(
    UpdateAppointmentStatusResponse.parse({
      ...appointment,
      doctorName: doctor?.name ?? "Doctor",
      specialty: doctor?.specialty ?? "General medicine",
    }),
  );
});

router.get("/enquiries", async (_req, res): Promise<void> => {
  const enquiries = await db
    .select()
    .from(enquiriesTable)
    .orderBy(desc(enquiriesTable.createdAt));
  res.json(ListEnquiriesResponse.parse(enquiries));
});

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [enquiry] = await db
    .insert(enquiriesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateEnquiryResponse.parse(enquiry));
});

router.post("/voice/calls", async (req, res): Promise<void> => {
  const parsed = StartVoiceCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const opening =
    "Hello, I’m the clinic’s appointment assistant. I can find the right doctor and book a suitable time for you. What would you like help with today?";
  const transcript: TranscriptMessage[] = [
    { role: "assistant", text: opening },
  ];
  if (parsed.data.initialMessage) {
    transcript.push({ role: "patient", text: parsed.data.initialMessage });
  }
  const [call] = await db
    .insert(voiceCallsTable)
    .values({ ...parsed.data, transcript })
    .returning();
  const suggestedSlots = await availableSlotRows(4);
  res.status(201).json(
    StartVoiceCallResponse.parse({
      ...call,
      assistantMessage: opening,
      suggestedSlots,
    }),
  );
});

router.post("/voice/calls/:id/turn", async (req, res): Promise<void> => {
  const params = ProcessVoiceTurnParams.safeParse(req.params);
  const body = ProcessVoiceTurnBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [call] = await db
    .select()
    .from(voiceCallsTable)
    .where(eq(voiceCallsTable.id, params.data.id));
  if (!call) {
    res.status(404).json({ error: "Voice call not found" });
    return;
  }

  const transcript: TranscriptMessage[] = [
    ...call.transcript,
    { role: "patient", text: body.data.message },
  ];
  let assistantMessage =
    "I found the closest available appointments. Choose a time and I’ll reserve it immediately.";
  let status = call.status;
  let appointmentId = call.appointmentId;

  if (body.data.slotId) {
    const [slot] = await db
      .select()
      .from(slotsTable)
      .where(
        and(
          eq(slotsTable.id, body.data.slotId),
          eq(slotsTable.status, "available"),
        ),
      );
    if (!slot) {
      res.status(409).json({ error: "That slot is no longer available" });
      return;
    }
    const [doctor] = await db
      .select()
      .from(doctorsTable)
      .where(eq(doctorsTable.id, slot.doctorId));
    const [appointment] = await db.transaction(async (tx) => {
      const created = await tx
        .insert(appointmentsTable)
        .values({
          patientName: call.patientName,
          patientPhone: call.patientPhone,
          doctorId: slot.doctorId,
          slotId: slot.id,
          date: slot.date,
          time: slot.time,
          reason: body.data.message,
          source: "ai_call",
          status: "booked",
        })
        .returning();
      await tx
        .update(slotsTable)
        .set({ status: "booked" })
        .where(eq(slotsTable.id, slot.id));
      return created;
    });
    appointmentId = appointment.id;
    status = "booked";
    assistantMessage = `You’re booked with ${doctor?.name ?? "the doctor"} on ${slot.date} at ${slot.time}. Your appointment is confirmed.`;
    await db.insert(enquiriesTable).values({
      patientName: call.patientName,
      phone: call.patientPhone,
      summary: body.data.message,
      source: "ai_call",
      status: "booked",
      appointmentId,
    });
  }

  transcript.push({ role: "assistant", text: assistantMessage });
  const [updated] = await db
    .update(voiceCallsTable)
    .set({ transcript, status, appointmentId })
    .where(eq(voiceCallsTable.id, call.id))
    .returning();
  const suggestedSlots =
    status === "booked" ? [] : await availableSlotRows(4);
  res.json(
    ProcessVoiceTurnResponse.parse({
      callId: updated.id,
      status: updated.status,
      assistantMessage,
      transcript: updated.transcript,
      suggestedSlots,
      appointmentId: updated.appointmentId,
    }),
  );
});

router.post("/voice/speech", async (req, res): Promise<void> => {
  const parsed = SynthesizeSpeechBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "ElevenLabs is not configured" });
    return;
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: parsed.data.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.55, similarity_boost: 0.75 },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    req.log.error(
      { status: response.status, detail: detail.slice(0, 300) },
      "ElevenLabs speech synthesis failed",
    );
    res.status(502).json({ error: "Voice synthesis is temporarily unavailable" });
    return;
  }

  const audioBase64 = Buffer.from(await response.arrayBuffer()).toString(
    "base64",
  );
  res.json(
    SynthesizeSpeechResponse.parse({
      audioBase64,
      contentType: response.headers.get("content-type") ?? "audio/mpeg",
    }),
  );
});

export default router;
