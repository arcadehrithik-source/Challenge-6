const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(system|developer|safety)\s+(prompt|rules|instructions)/i,
  /reveal\s+(your\s+)?(system\s+prompt|api\s+key|environment\s+variables|secrets)/i,
  /print\s+process\.env/i,
  /act\s+as\s+(a\s+)?(doctor|physician|medical\s+diagnoser)\s+and\s+prescribe/i,
  /<\s*script\b/i,
  /javascript:/i,
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function sanitizePlainText(input: string, maxLength = 600): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeResponseText(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}

export function enforcePayloadSize(rawBody: string, maxBytes = 16_384): boolean {
  return new TextEncoder().encode(rawBody).length <= maxBytes;
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Strip file paths or accidental env fragments
    return error.message.replace(/(sk-[a-zA-Z0-9_-]+|AIza[a-zA-Z0-9_-]+)/g, "[REDACTED]");
  }
  return "An unexpected error occurred.";
}
