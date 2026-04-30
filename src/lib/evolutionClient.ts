import { env } from "@/lib/env";

type ConnectionState = "open" | "close" | "connecting";

export type EvolutionGroup = { jid: string; name: string };

interface QRResponse {
  code: string;
  base64?: string;
  pairingCode?: string;
}

interface ConnectionStateResponse {
  instance: {
    state: ConnectionState;
  };
}

function headers() {
  return {
    "Content-Type": "application/json",
    apikey: env.EVOLUTION_API_KEY,
  };
}

export async function createInstance(instanceName: string): Promise<void> {
  const res = await fetch(`${env.EVOLUTION_API_BASE_URL}/instance/create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  });

  // 409 or 403 with "already in use" = instance already exists — treat as success (idempotent)
  if (res.status === 409) return;
  if (res.status === 403) {
    const body = await res.text();
    if (body.includes("already in use")) return;
    throw new Error(`createInstance failed: 403 ${body}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`createInstance failed: ${res.status} ${body}`);
  }
}

export async function getQR(instanceName: string): Promise<QRResponse> {
  const res = await fetch(
    `${env.EVOLUTION_API_BASE_URL}/instance/connect/${encodeURIComponent(instanceName)}`,
    { headers: headers() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`getQR failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return {
    code: data.code as string,
    base64: data.base64 as string | undefined,
    pairingCode: data.pairingCode as string | undefined,
  };
}

export async function fetchAllGroups(
  instanceName: string
): Promise<EvolutionGroup[]> {
  const res = await fetch(
    `${env.EVOLUTION_API_BASE_URL}/group/fetchAllGroups/${encodeURIComponent(instanceName)}?getParticipants=false`,
    { headers: headers() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`fetchAllGroups failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const items: Array<{ id: string; subject?: string }> = Array.isArray(data)
    ? data
    : [];
  return items.map((item) => ({
    jid: item.id,
    name: item.subject ?? item.id,
  }));
}

export async function sendTextMessage(
  instanceName: string,
  groupJid: string,
  text: string
): Promise<unknown> {
  const res = await fetch(
    `${env.EVOLUTION_API_BASE_URL}/message/sendText/${encodeURIComponent(instanceName)}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ number: groupJid, text }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`sendTextMessage failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function getConnectionState(
  instanceName: string
): Promise<ConnectionStateResponse> {
  const res = await fetch(
    `${env.EVOLUTION_API_BASE_URL}/instance/connectionState/${encodeURIComponent(instanceName)}`,
    { headers: headers() }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`getConnectionState failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data as ConnectionStateResponse;
}
