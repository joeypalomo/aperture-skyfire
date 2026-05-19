# APERTURE — PHASE 3 BUILD KICKOFF BRIEF (v3 — PATH-ALIGNED)

**Engagement:** SkyFire Energy / Fractional VP Commercial Sales — Option B (SOW-001)
**Brief compiled:** May 19, 2026
**Status:** All decisions locked. Working directory created. Ready to execute.
**Authority:** Phase 2 Artifact 8 — Phase 3 Readiness Brief

**Working directory:** `~/Desktop/SkyFire Energy/aperture-skyfire/`

---

# QUICK START

For Joey, sitting at the terminal. Four moves to building Aperture.

## MOVE 1 — Confirm directory structure (✅ done per your screenshot)

Existing layout:

```
~/Desktop/SkyFire Energy/aperture-skyfire/
  ├── Artifacts phase 1/
  ├── Artifacts phase 2/
  ├── reference/
  ├── assets/
  └── Docs/
```

## MOVE 2 — Populate the folders

| Folder | Contents |
|--------|----------|
| `Artifacts phase 1/` | All 6 Phase 1 artifacts (Source Inventory, Business Intelligence Brief, Constraint Hypothesis, Known Knowns Inventory, Open Questions Registry, Executive Summary) |
| `Artifacts phase 2/` | All 8 Phase 2 artifacts (Persona & Voice, Conversation Architecture, Tier 1/2/3 Flows, Knowledge Base & Output Spec, System Prompt v1, Phase 3 Readiness Brief) |
| `reference/` | David Nagy's source files (server.js, app.js, index.html, admin.html, system_prompt.md, cme_knowledge_base.md, vercel.json, package.json, _env.example) |
| `assets/` | eCommerce Inc. logo + SkyFire Energy logo + Aperture branding files (confirmed ready) |
| `Docs/` | This brief (v3) |

## MOVE 3 — Spin up the cloud services

| Service | Status | Action Required |
|---------|--------|-----------------|
| Supabase | ✅ Account exists | Create new project `aperture-skyfire`. Save: project URL, anon key, service role key. |
| GitHub | ✅ Account exists | Create private repo `aperture-skyfire`. Initialize empty. |
| Vercel | ✅ Account exists | Create new project, link to GitHub repo. Save project ID. |
| Resend | ⏳ Pending | Create account, verify sending domain (or use resend.dev sandbox for v1). Save API key. **Must be done before Step 8 of the build.** |
| Anthropic | ✅ Active | Confirm API key has access to `claude-opus-4-7`. Save key. |

## MOVE 4 — Create `.env.local` template

Open a terminal, navigate to the working directory, and create the env template:

```bash
cd "~/Desktop/SkyFire Energy/aperture-skyfire"

cat > .env.local.example << 'EOF'
# === LLM ===
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-opus-4-7

# === Database ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === Email (set up before Step 8) ===
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# === Admin ===
JOEY_ADMIN_EMAIL=joey.palomo@ecommercetexas.com

# === Security ===
SESSION_TOKEN_SECRET=

# === App ===
NEXT_PUBLIC_APP_URL=
EOF

cp .env.local.example .env.local
```

Fill in `.env.local` values as services come online. Leave Resend variables empty for now — they're not needed until Step 8.

## MOVE 5 — Open Claude Code in the working directory, paste THE PROMPT below

The build starts.

---

# THE LOCKED DECISIONS

| # | Decision | Final |
|---|----------|-------|
| 1 | Brand assets | ✅ All in `assets/` — eCommerce Inc. logo + SkyFire Energy logo + Aperture branding |
| 2 | **LLM model** | **Anthropic Claude `claude-opus-4-7`** (Opus 4.7 — premium reasoning; ~$60–80 total model spend across the 8-intake cohort) |
| 3 | Email delivery | Resend (pending setup — non-blocking for Steps 1–7) |
| 4 | Database | Supabase Postgres — handles BOTH ephemeral session state AND persistent transcripts (single DB; no Vercel KV) |
| 5 | Token expiration | 30 days from issue |
| 6 | Dry-run interviewee | David Nagy (friendly stand-in for Joey's end-to-end sign-off) |
| 7 | Token rotation | Single-use per session; resume via same token until completion or expiration |
| 8 | Build environment | Claude Code in `~/Desktop/SkyFire Energy/aperture-skyfire/` |
| 9 | **Invite distribution** | **Google Chat with execs.** Admin panel generates copyable URLs per interviewee; Joey pastes into shared chat. NO automated invite email system. |
| 10 | Transcript delivery | `joey.palomo@ecommercetexas.com` receives both raw transcripts and synthesis appendices |

---

# THE FIRST CLAUDE CODE PROMPT

After completing Moves 1–4 above, open a fresh Claude Code session in `~/Desktop/SkyFire Energy/aperture-skyfire/` and paste the following verbatim:

---

```
You are operating as the Phase 3 build engine for Aperture — a
conversational intake agent purpose-built for the SkyFire Energy
fractional engagement (Joey Palomo, eCommerce Texas / eCommerce Inc.,
SOW-001, May–August 2026).

The working directory is this directory. Its layout:

  Artifacts phase 1/   — Phase 1 specification (synthesis foundation)
  Artifacts phase 2/   — Phase 2 specification (the build manual)
  reference/           — David Nagy's prior agent code (pattern reference only)
  assets/              — brand assets (eCommerce Inc. logo, SkyFire logo, Aperture branding)
  Docs/                — this kickoff brief

(Folder names with spaces require quoted paths in shell commands —
handle this automatically.)

THE STANDARD

Every architectural decision traces to a Phase 2 artifact. Every
behavior traces to the system prompt in Phase 2 Artifact 7. David's
files inform HOW to ship the infrastructure efficiently — NOT WHAT to
build. The David-File Test fires every time a behavior is about to
ship that wasn't in Phase 2.

Anti-Slop Filter applies to every agent-generated output. Read-aloud
test required on every verbatim block.

THE LOCKED STACK

  Frontend:     Next.js 14+ (App Router) with TypeScript
  Hosting:      Vercel (auto-deploy from GitHub main)
  Database:     Supabase Postgres (BOTH ephemeral session state AND
                persistent transcripts — single DB, no Vercel KV)
  Auth admin:   Supabase magic link (Joey only)
  Auth user:    Signed single-use invite tokens (30-day expiration)
  LLM:          Anthropic claude-opus-4-7 (Opus 4.7)
  Email:        Resend (setup pending — required before Step 8)
  Version:      GitHub (private repo aperture-skyfire)
  Distribution: Google Chat — admin panel generates copyable URLs;
                Joey pastes into shared exec chat. NO automated invite
                emails.

YOUR FIRST TASK — ORIENTATION, NO CODE YET

Read these documents in order:

1. Docs/SkyFire_Phase3_Aperture_Build_Kickoff_Brief_v3.md
   (this brief — read first for full context)

2. "Artifacts phase 2/08_Phase2_Phase3_Readiness_Brief.md"
   (the build manual)

3. "Artifacts phase 2/07_Phase2_Aperture_System_Prompt_v1.md"
   (the deployable system prompt — Part 1 is operational, Part 2 is
   maintainer commentary)

4. "Artifacts phase 2/06_Phase2_Knowledge_Base_and_Output_Spec.md"
   (three-layer memory model and email output specifications)

5. "Artifacts phase 2/02_Phase2_Conversation_Architecture.md"
   (flow logic, completion detection, probe protocol, contradiction
   handling, no-lane-violation safeguards)

6. "Artifacts phase 2/01_Phase2_Aperture_Persona_Voice_Spec.md"
   (voice, opening sequence, closing sequence, FAQ — verbatim)

7. reference/server.js
   (David's Express implementation — pattern reference only)

8. reference/system_prompt.md
   (David's prompt structure — pattern reference only)

Read Artifacts 3, 4, 5 (per-stakeholder flows) on demand when we
configure those.

CONFIRM THREE THINGS

(a) WHAT we're building — the 8-interview asynchronous conversational
    intake agent (Tier 1: Dave Vonesch, Greg Sauer; Tier 2: Landon
    Aldridge, Jason Jackson, Curtis Buxton; Tier 3: Robert Silver,
    Bryce Hayes, Stacy Haakonson). The three-layer knowledge model.
    The pause/resume persistence requirement. The transcript +
    synthesis email delivery to Joey at
    joey.palomo@ecommercetexas.com.

(b) THE STACK — locked as above. The override from the Phase 2
    Readiness Brief: Supabase handles BOTH ephemeral session state
    AND persistent transcripts. Opus 4.7 is the production model.
    Google Chat is the distribution mechanism (admin generates links,
    Joey pastes).

(c) THE BUILD ORDER — Step 1: Supabase schema (foundation). Then
    Next.js scaffold. Then auth/token system. Then conversation
    engine core. Then three-layer knowledge access. Then
    per-stakeholder flow configuration. Then persistence
    (pause/resume across browsers and devices). Then email pipeline
    via Resend. Then branding and polish. Then five required test
    cases plus Joey's end-to-end dry run with David Nagy as stand-in.

After confirming, propose your first concrete action — the Supabase
schema design for five tables: sessions, messages, scorecards,
contradictions, synthesis_outputs. Include the columns, types,
indexes, and RLS policy outline. Wait for my approval before
executing via the Supabase MCP.

ONE NOTE ON SCOPE DISCIPLINE

If during the build you surface a "we could also build X" idea —
feature creep — apply the same lane discipline Aperture itself uses.
The scope is fixed: 8 interviews, May 29 milestone, verbatim Phase 2
specifications. Polish that doesn't ship a working agent is feature
creep. Resist.

Aperture v1 ships by May 29. The standard is genius-level excellence.

Let's build.
```

---

# WHAT HAPPENS AFTER YOU PASTE THE PROMPT

Claude Code reads everything. Confirms understanding (a)/(b)/(c). Proposes the Supabase schema. You approve via Supabase MCP execution. The build begins.

From there, every step in the 10-step build sequence gets executed interactively. Claude Code proposes, you approve or revise, code ships. The MCPs (Supabase, GitHub, Vercel) let Claude Code execute infrastructure changes directly.

**Joey's role during the build:** architect signing off on each step. Not engineer. You review the proposal, push back if the read-aloud test fails or the no-lane-violation safeguards weaken, approve when it lands. Claude Code does the typing.

**Estimated timeline:** Steps 1–6 — 2 days. Steps 7–8 — 1 day. Steps 9–10 — 1–2 days. Aperture ships May 22–24. Buffer for fixes through May 27. Invites send May 27–28. Intake window closes May 28. May 29 Month 1 Assessment lands on real intelligence.

---

# THE BUILD ORDER — REFERENCE

| Step | What ships | Acceptance gate |
|------|-----------|-----------------|
| 1 | Supabase schema (5 tables, RLS, indexes) | Migrations applied via MCP; Joey can read all tables |
| 2 | Next.js scaffold + Vercel deploy from GitHub main | Production URL responds with hello-world |
| 3 | Single-use invite token system | Joey generates link in admin panel, `/i/{token}` loads welcome screen |
| 4 | Conversation engine core (Anthropic + system prompt v1) | Test session completes 2-turn conversation; messages persist |
| 5 | Three-layer knowledge access (Known Knowns / Brief / Scorecard) | Scorecard updates land in `scorecards` table per turn |
| 6 | Per-stakeholder configs (all 8 flows loaded) | Each interviewee's token loads correct flow; Stacy safeguards verified |
| 7 | Pause/resume persistence | Test interviewee pauses at msg 5, resumes 24 hours later from different device |
| 8 | Email pipeline via Resend (requires Resend setup) | Two emails per session: start notification + completion w/ synthesis |
| 9 | Branding + polish (eCommerce Inc. + SkyFire co-mark) | All surfaces render correctly; opening sequence read-aloud test passes |
| 10 | Test cases + Joey dry-run with David Nagy | All 5 test cases pass; Joey signs off |

---

# THE ACCEPTANCE CRITERIA — SHIP READY

Aperture is ready to send invites when ALL of the following are true:

- [ ] All 8 interviewee flows configured and tested in dry-run
- [ ] All 5 required test cases pass (Happy Path, Thin Answers, Pause/Resume, Lane Pressure, Contradiction Surface)
- [ ] All edge case scenarios behave as specified (browser close, FAQ in turn 1, declination, language fallback, inactivity, wrong token)
- [ ] Aperture System Prompt v1 deployed verbatim with no edits
- [ ] Resend email delivery to Joey tested and reliable
- [ ] Pause/resume tested across browsers AND across devices
- [ ] Branding renders correctly on welcome screen, chat interface, and email templates
- [ ] Opening sequence and closing sequence verbatim from Phase 2 Artifact 1
- [ ] Admin panel "Generate Link" function produces 8 unique single-use URLs ready for Google Chat distribution
- [ ] Anti-Slop Filter audit passes on every agent-generated output sample
- [ ] Joey personal dry-run complete; sign-off given

---

# WHEN THINGS GET STRATEGIC, COME BACK HERE

During the build, Claude Code handles engineering decisions. If something surfaces that's strategic — scope, voice, lane discipline, a hard tradeoff between two architectural paths that both pass the David-File Test — pause the Claude Code session and bring it back to this chat.

Otherwise, Claude Code drives. Aperture ships.

---

**END OF PHASE 3 BUILD KICKOFF BRIEF v3**

*Aperture — purpose-built for SkyFire Energy. Built once. Shipped right. May 29 milestone holds.*
