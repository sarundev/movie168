import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "../../../lib/server-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;
  try {
    const data = await serverApi(`/payments/${transactionId}/status`, { withAuth: true });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return NextResponse.json(
      { message: err.message ?? "Error" },
      { status: err.status ?? 500 }
    );
  }
}
