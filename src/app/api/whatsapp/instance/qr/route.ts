import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { getQR } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  const { code } = await getQR(instance.instance_name);
  const dataUrl = await QRCode.toDataURL(code, {
    margin: 3,
    scale: 4,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#ffffff" },
  });
  return NextResponse.json({ qr: dataUrl });
}, { logLabel: "[GET /api/whatsapp/instance/qr]" });
