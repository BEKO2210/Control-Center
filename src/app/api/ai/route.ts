// ============================================================================
// Clawbot Mission Control — AI proxy route (DEFEKT-4, Phase 2)
//
// Server-side proxy to the Anthropic Messages API. This is the secure path:
//  - In a real deployment, set ANTHROPIC_API_KEY (a server-only, NON-public
//    env var). The key then lives ONLY on the server and never reaches the
//    browser at all.
//  - For the backend-less local mode, the client may pass its session key via
//    the `x-client-key` header; the server uses it just for that request.
//
// Either way the actual Anthropic call happens here, so the browser no longer
// needs the `anthropic-dangerous-direct-browser-access` escape hatch.
// ============================================================================

import { NextResponse } from 'next/server';
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_API_VERSION,
  AI_BRIDGE_MAX_TOKENS,
  AI_BRIDGE_MODEL,
} from '@/lib/constants';

export const runtime = 'nodejs';

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string };
}

interface AiRequestBody {
  prompt?: string;
}

const serverKey = (): string | undefined => process.env.ANTHROPIC_API_KEY;

/**
 * Advertise whether a server-side key is configured, so the client can enable
 * the AI UI even when the user never pasted a key into the wizard.
 *
 * @returns `{ serverKeyConfigured: boolean }`
 * @example await fetch('/api/ai').then((r) => r.json())
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ serverKeyConfigured: Boolean(serverKey()) });
}

/**
 * Proxy a single completion to Anthropic.
 *
 * @param request - POST with `{ prompt }`; optional `x-client-key` header.
 * @returns `{ text }` on success, or `{ error }` with a 4xx/5xx status.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = serverKey() || request.headers.get('x-client-key') || '';
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No Anthropic API key configured (server env or client key).' },
      { status: 401 },
    );
  }

  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt.' }, { status: 400 });
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: AI_BRIDGE_MODEL,
        max_tokens: AI_BRIDGE_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const data = (await response.json()) as AnthropicResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? `Anthropic HTTP ${response.status}` },
        { status: response.status },
      );
    }

    const text =
      data.content
        ?.filter((b) => b.type === 'text' && b.text)
        .map((b) => b.text)
        .join('\n')
        .trim() ?? '';

    if (!text) {
      return NextResponse.json(
        { error: 'Empty completion from Claude.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream AI error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
