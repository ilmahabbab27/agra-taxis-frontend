import chrono from 'chrono-node';
import fetch from 'node-fetch';

const API_BASE = (process.env.VITE_API_BASE_URL || 'http://localhost/Agra%20Taxis%20Backend/public/api').replace(/\/$/, '');
const SUPPORT_WEBHOOK = process.env.SUPPORT_WEBHOOK || '';

export type SessionState = {
  step: 'collect_service' | 'collect_vehicle' | 'collect_pickup' | 'collect_destination' | 'collect_datetime' | 'confirm' | 'collect_contact_for_handoff' | 'handoff' | 'done';
  buffer: Record<string, any>;
};

export function initialSession(): SessionState {
  return { step: 'collect_service', buffer: {} };
}

function normalizeDateTime(text: string): { date: string | null; time: string | null } {
  if (!text) return { date: null, time: null };
  const t = text.trim().toLowerCase();
  if (["asap", "no preference", "no-preference", "anytime", "skip"].includes(t)) {
    return { date: null, time: null };
  }

  // Try chrono parsing
  const parsed = chrono.parseDate(text, new Date());
  if (!parsed) return { date: null, time: null };

  const isoDate = parsed.toISOString().slice(0, 10); // YYYY-MM-DD
  const hh = parsed.getHours().toString().padStart(2, '0');
  const mm = parsed.getMinutes().toString().padStart(2, '0');
  const isoTime = `${hh}:${mm}`;

  return { date: isoDate, time: isoTime };
}

async function callFareEstimate(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/fare-estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({ success: false, error: { message: 'Invalid JSON response' } }));
  return { status: res.status, ok: res.ok, json };
}

function isHandoffRequest(text: string): boolean {
  if (!text) return false;
  const t = text.trim().toLowerCase();
  if (/^\s*(talk to agent|talk to human|agent|human|representative|support|help me|operator)\s*$/i.test(t)) return true;
  // Accept '5' as a possible numbered choice if you include it in menus elsewhere
  if (/^\s*5\s*$/.test(t)) return true;
  return false;
}

async function callOperator(session: SessionState, userMessage: string): Promise<{ success: boolean; error?: string }>{
  const payload = {
    session: session.buffer || {},
    userMessage,
    timestamp: new Date().toISOString(),
  };

  try {
    if (SUPPORT_WEBHOOK) {
      const res = await fetch(SUPPORT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return { success: false, error: `webhook responded ${res.status}` };
      }
      return { success: true };
    }

    // Fallback: try backend support endpoint (if available)
    const res = await fetch(`${API_BASE}/support/handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { success: false, error: `backend responded ${res.status}` };
    return { success: true };
  } catch (ex: any) {
    return { success: false, error: (ex && ex.message) || String(ex) };
  }
}

export async function handleUserMessage(session: SessionState, message: string) {
  const reply = { text: '', session } as any;

  // Global handoff shortcut: user can type "talk to agent" or "agent" or press a Talk-to-Agent button
  if (isHandoffRequest(message)) {
    // If we don't have contact, ask for it first
    if (!session.buffer.contact) {
      session.step = 'collect_contact_for_handoff';
      reply.text = 'Sure — I can connect you to a human. Please share a contact number or email so the agent can reach you, or type "skip" to continue without contact.';
      reply.session = session;
      return reply;
    }

    // We have contact — perform handoff
    const handoffResult = await callOperator(session, message);
    session.step = 'handoff';
    reply.text = handoffResult.success
      ? 'You are being connected to an agent. They will reach out shortly.'
      : `Unable to connect to an agent right now: ${handoffResult.error || 'please try again later'}`;
    reply.session = session;
    return reply;
  }
  switch (session.step) {
    case 'collect_service':
      // Expect: "Passenger" or "Lorry"
      if (/lorry/i.test(message)) session.buffer.service_type = 'Lorry';
      else session.buffer.service_type = 'Passenger';
      session.step = 'collect_vehicle';
      reply.text = `Got it — ${session.buffer.service_type}. Which vehicle (or lorry size) would you like?`;
      break;

    case 'collect_vehicle':
      // For Passenger we expect user to pick a vehicle name or id. Here we store raw input and the integrator should resolve to vehicle_id.
      session.buffer.vehicle_label = message;
      // integrator: resolve `vehicle_label` → `vehicle_id` via API /vehicles
      session.step = 'collect_pickup';
      reply.text = 'Please provide the pickup location (address or share location).';
      break;

    case 'collect_pickup':
      session.buffer.pickup_text = message;
      session.step = 'collect_destination';
      reply.text = 'Please provide the destination location (address or share location).';
      break;

    case 'collect_destination':
      session.buffer.destination_text = message;
      session.step = 'collect_datetime';
      reply.text = "When would you like to be picked up? (enter date/time or reply 'ASAP' / 'No preference')";
      break;

    case 'collect_datetime': {
      const { date, time } = normalizeDateTime(message);
      session.buffer.date = date; // nullable
      session.buffer.time = time; // nullable

      // Build payload for fare-estimate. Integrator should resolve vehicle_label → vehicle_id before calling.
      const payload: Record<string, any> = {
        service_type: session.buffer.service_type,
        // vehicle_id: <resolve this from vehicle_label> - placeholder below
        // for integrator, perform a lookup by name or show choices earlier
        trip: 'One Way',
        pickup_text: session.buffer.pickup_text,
        destination_text: session.buffer.destination_text,
        days: 1,
        pax: 1,
      };

      if (session.buffer.vehicle_id) payload.vehicle_id = session.buffer.vehicle_id;
      else payload.vehicle_id = session.buffer.vehicle_label ? 1 : 1; // fallback placeholder

      // Optional fields
      if (date !== null) payload.date = date;
      if (time !== null) payload.time = time;
      else {
        // explicit null to indicate no preference
        payload.date = null;
        payload.time = null;
      }

      // Example passenger defaults (integrator should set proper values earlier)
      if (session.buffer.service_type === 'Passenger') {
        payload.days = session.buffer.days ?? 1;
        payload.pax = session.buffer.pax ?? 1;
        payload.ac = session.buffer.ac ?? 'AC';
      }

      reply.text = 'Calculating estimate...';
      session.step = 'confirm';

      // Call backend
      try {
        const result = await callFareEstimate(payload);
        if (result.ok && result.json && result.json.success) {
          const data = result.json.data || result.json;
          reply.text = `Estimated fare: ${data.total_cost ?? data.estimatedFare ?? 'N/A'} (distance ${data.distance_km ?? data.distanceKm ?? 'N/A'} km).`;
          reply.data = data;
          session.step = 'done';
        } else {
          const err = result.json?.error?.message || result.json?.message || 'Unknown error';
          reply.text = `Sorry, I couldn't calculate the fare: ${err}`;
          session.step = 'collect_datetime';
        }
      } catch (ex) {
        reply.text = `Request failed: ${ex.message || ex}`;
        session.step = 'collect_datetime';
      }

      break;
    }

    case 'confirm':
      reply.text = 'Working on your estimate...';
      break;

    default:
      reply.text = "Let's start — do you want a Passenger vehicle or a Lorry?";
      session.step = 'collect_service';
      break;
  }

  return reply;
}
