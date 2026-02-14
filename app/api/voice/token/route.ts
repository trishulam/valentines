import { NextResponse } from "next/server";

const OPENAI_REALTIME_URL = "https://api.openai.com/v1/realtime/client_secrets";

export async function POST(): Promise<NextResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(OPENAI_REALTIME_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data: { value: string; expires_at: string } = await response.json();

    return NextResponse.json(
      {
        ephemeralKey: data.value,
        expiresAt: data.expires_at,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to generate ephemeral key", error);
    return NextResponse.json(
      { error: "Failed to generate ephemeral key" },
      { status: 500 }
    );
  }
}

