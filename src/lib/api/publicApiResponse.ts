import { NextResponse } from "next/server";

export function apiError(
  error: string,
  status: number,
  headers?: HeadersInit
) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "private, no-store");
  if (status === 429) responseHeaders.set("Retry-After", "60");

  return NextResponse.json(
    { error },
    { status, headers: responseHeaders }
  );
}

export function apiData<T>(data: T, status = 200) {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}

export async function readJsonObject(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null &&
      typeof body === "object" &&
      !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
