// Typed env-var loader. Throws at boot if a required variable is missing,
// so we surface configuration errors immediately rather than at the first
// request. Variables read only on the server are NOT exposed to the client;
// only NEXT_PUBLIC_* values are safe in the browser bundle.

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local (local) or the Vercel project env (production).`,
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

// Server-only env. Importing this from a client component will throw at
// build time because process.env access is inlined per environment.
export const serverEnv = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7",
  anthropicExtractionModel:
    process.env.ANTHROPIC_EXTRACTION_MODEL ?? "claude-haiku-4-5-20251001",
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  sessionTokenSecret: required("SESSION_TOKEN_SECRET"),
  joeyAdminEmail:
    process.env.JOEY_ADMIN_EMAIL ?? "joey.palomo@ecommercetexas.com",
  resendApiKey: optional("RESEND_API_KEY"),
  resendFromEmail: optional("RESEND_FROM_EMAIL"),
  appUrl: optional("NEXT_PUBLIC_APP_URL"),
} as const;

// Public env. Safe to import from client components.
export const publicEnv = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  appUrl: optional("NEXT_PUBLIC_APP_URL"),
} as const;
