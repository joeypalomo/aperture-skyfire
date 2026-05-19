const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
const archiver = require('archiver');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const SYSTEM_PROMPT_PATH = path.join(__dirname, 'knowledge_base', 'system_prompt.md');
const KNOWLEDGE_BASE_PATH = path.join(__dirname, 'knowledge_base', 'cme_knowledge_base.md');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── PostgreSQL connection pool ─────────────────────────────────────────────
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id SERIAL PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      stakeholder_name TEXT,
      stakeholder_email TEXT,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      message_count INTEGER DEFAULT 0,
      transcript_json JSONB NOT NULL,
      saved_at TIMESTAMPTZ DEFAULT NOW(),
      filename TEXT
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_transcripts_saved_at ON transcripts (saved_at DESC)`);
}
async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL is not set — transcripts will NOT be saved!');
    return;
  }
  try {
    await ensureTable();
    const result = await db.query('SELECT COUNT(*) AS cnt FROM transcripts');
    console.log(`Database connected. Transcripts in DB: ${result.rows[0].cnt}`);
  } catch (err) {
    console.error('CRITICAL: Database connection failed —', err.message);
  }
}
initDatabase();

// ── Helpers ────────────────────────────────────────────────────────────────

// Known stakeholders with role-specific interview context
const KNOWN_STAKEHOLDERS = {
  'mathew wilson': {
    role: 'EVP & COO',
    track: 'EXECUTIVE TRACK',
    context: `Mathew is the EVP & COO. He led the 20-staff stakeholder consultations in December 2025 and is fully aware of operational pain points — do not cover these with him. He is NOT involved in day-to-day event operations and has stated this explicitly. His concerns are strategic: financial visibility during the PLANNING stages of events, access to historical performance data for strategic decisions, and data transparency across the organization. Use the EXECUTIVE TRACK questions. Do NOT ask about event workflows, registration, badge printing, email automation, or any operational/day-to-day topics under any circumstances.`
  },
  'dennis darby': {
    role: 'CEO',
    track: 'EXECUTIVE TRACK',
    context: `Dennis is the CEO and project sponsor. He is the ultimate approver. Focus on organizational outcomes, strategic value of the platform investment, and what success looks like at the board/leadership level. Use the EXECUTIVE TRACK questions.`
  },
  'leninka turcotte': {
    role: 'VP, British Columbia',
    track: 'OPERATIONS/REGIONAL VP TRACK',
    context: `Leninka's #1 pain point is rebuilding events from scratch — no templates. Her #1 requirement is reusable event templates. She manually exports registration lists to SharePoint daily. These are already documented — focus on gaps: approval workflows, multi-session structures, regional branding, sponsor management for BC events.`
  },
  'marie morden': {
    role: 'VP, Ontario Operations & Member Services',
    track: 'OPERATIONS/REGIONAL VP TRACK',
    context: `Marie oversees Ontario operations and member services from the national office. Focus on cross-provincial coordination, member services integration with events, approval chains, and reporting needs.`
  },
  'carlos': {
    role: 'Prairies Regional Representative',
    track: 'OPERATIONS/REGIONAL VP TRACK',
    context: `Carlos covers the Prairies region. Focus on Prairies-specific event types, regional customization, and any unique workflows compared to other regions.`
  },
  'julie fortier': {
    role: 'VP, Government Relations & Communications',
    track: 'COMMUNICATIONS/GR TRACK',
    context: `Julie Fortier runs advocacy events including Hill Day (government official engagement). Focus on government official database management, advocacy event logistics, email communications for GR events, bilingual needs for government-facing events, and Campaign Monitor integration.`
  },
  'ryan greer': {
    role: 'Government Relations',
    track: 'COMMUNICATIONS/GR TRACK',
    context: `Ryan works in Government Relations. Focus on external stakeholder engagement events and government relations event specifics.`
  },
  'jennifer doyle': {
    role: 'HR',
    track: 'HR TRACK',
    context: `Jennifer handles HR. Focus on staff training event requirements, internal governance events, and any HR compliance requirements for training records.`
  },
  'vijay prajapati': {
    role: 'IT Operations Lead',
    track: 'IT/TECHNICAL TRACK',
    context: `Vijay leads IT Operations and has limited bandwidth — vendor implementation support will be needed. Focus on integration complexity (Zoho CRM, Business Central, Campaign Monitor), API requirements, security and data residency, and what his team can own versus what requires vendor support.`
  },
  'jackie rosen': {
    role: 'EA to CEO',
    track: 'COORDINATOR TRACK',
    context: `Jackie Rosen is EA to the CEO. Focus on event communication distribution, coordination support workflows, and any unique coordination pain points.`
  },
  'erin': {
    role: 'Ontario Event Coordinator',
    track: 'EVENT COORDINATOR TRACK',
    context: `Erin's top pain point is badge printing — currently entirely manual via Excel mail merge (Tier 0 deal-breaker, already documented). Focus on onsite execution workflow, check-in processes, day-of-event management, walk-up registrations, and session tracking.`
  },
  'juliette': {
    role: 'National Conference Coordinator',
    track: 'EVENT COORDINATOR TRACK',
    context: `Juliette coordinates the National Conference — CME's most complex event. Focus on multi-day/multi-session structures, concurrent sessions, sponsor and exhibitor management, floor plan requirements, and large-scale attendee management.`
  },
  'jen': {
    role: 'Finance',
    track: 'FINANCE TRACK',
    context: `Jen is in Finance. Transaction-level financial reporting (NOT lump-sum deposits) is already confirmed as a Tier 0 deal-breaker — do not re-ask. Focus on payment method specifics, refund and cancellation policies, corporate invoicing (NET 30, POs), Microsoft Business Central integration depth, and financial reporting breakdowns by region and event type.`
  },
  'jackie': {
    role: 'Atlantic Regional Representative',
    track: 'OPERATIONS/REGIONAL VP TRACK',
    context: `Jackie covers the Atlantic region. Focus on Atlantic-specific event types and any unique requirements for smaller-volume provincial operations.`
  }
};

function lookupStakeholder(name) {
  if (!name) return null;
  const normalized = name.trim().toLowerCase();
  // Exact match first
  if (KNOWN_STAKEHOLDERS[normalized]) return KNOWN_STAKEHOLDERS[normalized];
  // Partial match (first name or last name)
  for (const [key, value] of Object.entries(KNOWN_STAKEHOLDERS)) {
    if (normalized.includes(key) || key.includes(normalized)) return value;
    const parts = key.split(' ');
    if (parts.some(p => normalized === p || normalized.startsWith(p))) return value;
  }
  return null;
}

function loadSystemPrompt() {
  try {
    return fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  } catch (err) {
    console.error('Failed to load system prompt:', err.message);
    return null;
  }
}

function loadKnowledgeBase() {
  try {
    return fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
  } catch (err) {
    console.warn('Knowledge base file not found:', err.message);
    return null;
  }
}

function buildSystemPrompt(stakeholder) {
  const systemPrompt = loadSystemPrompt();
  if (!systemPrompt) return null;

  const knowledgeBase = loadKnowledgeBase();
  const kb = knowledgeBase ? `\n\n---\n\n## REFERENCE KNOWLEDGE BASE\n\n${knowledgeBase}` : '';

  const known = lookupStakeholder(stakeholder.name);
  const participantSection = known
    ? `\n\n---\n\n## CURRENT SESSION PARTICIPANT\n\n**Name:** ${stakeholder.name}\n**Role:** ${known.role}\n**Interview Track:** ${known.track}\n**Email:** ${stakeholder.email || 'Not provided'}\n\n**Specific guidance for this participant:**\n${known.context}\n\nBegin the interview immediately using the ${known.track}. Do not ask them to describe their role — you already know it. Greet them by name, briefly confirm the focus area of this interview, and proceed with the appropriate questions.`
    : `\n\n---\n\n## CURRENT SESSION PARTICIPANT\n\n**Name:** ${stakeholder.name}\n**Email:** ${stakeholder.email || 'Not provided'}\n\nThis participant is not on the pre-identified stakeholder list. Start by asking: "To make sure I ask you the right questions — could you tell me your role at CME and your main involvement with events?" Then select the appropriate interview track based on their answer.`;

  return `${systemPrompt}${kb}${participantSection}`;
}

async function getAllTranscripts() {
  const result = await db.query(`
    SELECT session_id, stakeholder_name, stakeholder_email, started_at,
           completed_at, message_count, saved_at, filename,
           length(transcript_json::text) AS size
    FROM transcripts
    ORDER BY saved_at DESC
  `);
  return result.rows.map(r => ({
    filename: r.filename || `interview_${r.session_id}.json`,
    sessionId: r.session_id,
    stakeholderName: r.stakeholder_name || 'Unknown',
    stakeholderEmail: r.stakeholder_email || '',
    startedAt: r.started_at,
    completedAt: r.completed_at,
    totalMessages: r.message_count || 0,
    savedAt: r.saved_at,
    size: parseInt(r.size) || 0
  }));
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
  });
}

function emailConfigured() {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.ADMIN_EMAIL);
}

async function sendStartEmail(stakeholder) {
  if (!emailConfigured()) return;
  try {
    const { name, email } = stakeholder;
    await createTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `CME Interview STARTED — ${name}`,
      text: [
        `A stakeholder has just started their CME Event Platform requirements interview.`,
        ``,
        `Participant: ${name}`,
        `Email:       ${email}`,
        `Started:     ${new Date().toLocaleString('en-CA')}`,
        ``,
        `You will receive another email with the full transcript when they finish.`
      ].join('\n')
    });
    console.log(`Start notification sent for ${name}`);
  } catch (err) {
    console.error('Failed to send start email:', err.message);
  }
}

async function sendCompletionEmail(transcript) {
  if (!emailConfigured()) return;
  try {
    const { name, email } = transcript.metadata.stakeholder;
    const startedAt  = new Date(transcript.metadata.startedAt);
    const completedAt = new Date(transcript.metadata.completedAt);
    const duration = Math.max(0, Math.round((completedAt - startedAt) / 60000));
    const turns = transcript.conversation?.length || transcript.metadata.totalMessages || 0;

    const divider = '─'.repeat(60);

    const conversationText = (transcript.conversation || []).map(turn => {
      const speaker = turn.role === 'assistant' ? 'AI INTERVIEWER' : name.toUpperCase();
      return `[${speaker}]\n${turn.content}`;
    }).join('\n\n');

    const textBody = [
      `CME Event Platform — Interview Completed`,
      divider,
      ``,
      `Participant:  ${name}`,
      `Email:        ${email}`,
      `Started:      ${startedAt.toLocaleString('en-CA')}`,
      `Completed:    ${completedAt.toLocaleString('en-CA')}`,
      `Duration:     ~${duration} minute(s)`,
      `Exchanges:    ${turns} messages`,
      ``,
      divider,
      `FULL TRANSCRIPT`,
      divider,
      ``,
      conversationText,
      ``,
      divider,
      `This transcript is also saved in the admin panel.`
    ].join('\n');

    await createTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `CME Interview COMPLETED — ${name} (${turns} messages, ~${duration} min)`,
      text: textBody
    });

    console.log(`Completion email with full transcript sent for ${name}`);
  } catch (err) {
    console.error('Failed to send completion email:', err.message);
  }
}

// Keep for backward compatibility with any remaining sendEmail:true calls
async function sendNotificationEmail(transcript) {
  return sendCompletionEmail(transcript);
}

// ── Admin authentication middleware ────────────────────────────────────────

function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({ error: 'Admin access not configured. Set ADMIN_PASSWORD environment variable.' });
  }
  const provided = req.headers['x-admin-key'] || req.query.key;
  if (!provided || provided !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing admin key.' });
  }
  next();
}

// ── Middleware ─────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Public routes ──────────────────────────────────────────────────────────

app.get('/api/knowledge-base-status', (req, res) => {
  const prompt = loadSystemPrompt();
  const kb = loadKnowledgeBase();
  const totalSize = (prompt ? prompt.length : 0) + (kb ? kb.length : 0);
  res.json({ loaded: !!prompt, size: totalSize });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stakeholder } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set.' });
    }

    const systemPrompt = buildSystemPrompt(stakeholder);
    if (!systemPrompt) {
      return res.status(500).json({ error: 'System prompt not found. Ensure knowledge_base/system_prompt.md exists.' });
    }

    // Keep only the most recent exchanges to stay within token-per-minute limits.
    // The large system prompt (~6,600 tokens) leaves limited room for history.
    // We always keep the first message (opening prompt) + the last 20 messages.
    const MAX_HISTORY = 20;
    let trimmed = messages.map(m => ({ role: m.role, content: m.content }));
    if (trimmed.length > MAX_HISTORY) {
      const first = trimmed[0];
      let recent = trimmed.slice(-(MAX_HISTORY - 1));
      // Must start with a user message for Claude to accept the array
      while (recent.length > 0 && recent[0].role !== 'user') recent = recent.slice(1);
      trimmed = [first, ...recent];
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: trimmed
    });

    res.json(response);
  } catch (error) {
    console.error('Anthropic SDK error:', error);
    if (error instanceof Anthropic.APIError) {
      const isRateLimit = error.status === 429;
      return res.status(error.status || 500).json({
        error: isRateLimit
          ? 'RATE_LIMIT'
          : (error.message || 'Anthropic API error')
      });
    }
    res.status(500).json({ error: 'Failed to get response from AI: ' + error.message });
  }
});

// Called the moment a participant submits their details and starts the interview
app.post('/api/interview-started', async (req, res) => {
  try {
    const { stakeholder } = req.body;
    if (!stakeholder?.name) return res.status(400).json({ error: 'Missing stakeholder' });
    sendStartEmail(stakeholder); // fire-and-forget
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Called when participant closes browser (sendBeacon) or via End Session
// Reads the latest transcript from DB and emails the full text
app.post('/api/interview-completed', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const result = await db.query(
      'SELECT transcript_json FROM transcripts WHERE session_id=$1 LIMIT 1',
      [sessionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found in database' });
    }
    const transcript = result.rows[0].transcript_json;
    sendCompletionEmail(transcript); // fire-and-forget
    res.json({ ok: true });
  } catch (err) {
    console.error('interview-completed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-transcript', async (req, res) => {
  try {
    const { stakeholder, messages, startedAt, completedAt, sessionId, sendEmail } = req.body;

    const safeName = (stakeholder.name || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    const sessionKey = sessionId || `${safeName}_${Date.now()}`;
    const filename = `interview_${sessionKey}.json`;
    const now = new Date().toISOString();

    const transcript = {
      metadata: {
        interviewId: `${safeName}_${Date.now()}`,
        stakeholder: {
          name: stakeholder.name,
          email: stakeholder.email || '',
          firstName: stakeholder.firstName || '',
          lastName: stakeholder.lastName || ''
        },
        startedAt: startedAt || now,
        completedAt: completedAt || now,
        totalMessages: messages.length,
        model: 'claude-sonnet-4-20250514',
        organization: 'Canadian Manufacturers & Exporters (CME)',
        projectContext: 'CME Event Management Platform Requirements Gathering'
      },
      conversation: messages.map((msg, index) => ({
        turn: index + 1,
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : (msg.content[0]?.text || ''),
        timestamp: msg.timestamp || null
      })),
      savedAt: now,
      filename
    };

    await db.query(`
      INSERT INTO transcripts
        (session_id, stakeholder_name, stakeholder_email, started_at, completed_at,
         message_count, transcript_json, saved_at, filename)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (session_id) DO UPDATE SET
        stakeholder_name  = EXCLUDED.stakeholder_name,
        stakeholder_email = EXCLUDED.stakeholder_email,
        started_at        = EXCLUDED.started_at,
        completed_at      = EXCLUDED.completed_at,
        message_count     = EXCLUDED.message_count,
        transcript_json   = EXCLUDED.transcript_json,
        saved_at          = EXCLUDED.saved_at,
        filename          = EXCLUDED.filename
    `, [
      sessionKey,
      stakeholder.name || 'Unknown',
      stakeholder.email || '',
      startedAt || now,
      completedAt || now,
      messages.length,
      JSON.stringify(transcript),
      now,
      filename
    ]);

    if (sendEmail === true) {
      sendNotificationEmail(transcript);
    }

    res.json({ success: true, filename, interviewId: transcript.metadata.interviewId });
  } catch (error) {
    console.error('Error saving transcript:', error);
    res.status(500).json({ error: 'Failed to save transcript: ' + error.message });
  }
});

// ── Admin routes (password protected) ─────────────────────────────────────

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// List all transcripts
app.get('/api/admin/transcripts', requireAdmin, async (req, res) => {
  try {
    const transcripts = await getAllTranscripts();
    res.json({ transcripts, count: transcripts.length });
  } catch (error) {
    console.error('List transcripts error:', error);
    res.status(500).json({ error: 'Failed to list transcripts' });
  }
});

// Download single transcript — look up by filename or session_id
app.get('/api/admin/transcripts/:filename', requireAdmin, async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const sessionId = filename.replace(/^interview_/, '').replace(/\.json$/, '');
    const result = await db.query(
      'SELECT transcript_json, filename FROM transcripts WHERE filename=$1 OR session_id=$2 LIMIT 1',
      [filename, sessionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    const row = result.rows[0];
    const outName = row.filename || filename;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(JSON.stringify(row.transcript_json, null, 2));
  } catch (error) {
    console.error('Download transcript error:', error);
    res.status(500).json({ error: 'Failed to retrieve transcript' });
  }
});

// Download all transcripts as a ZIP
app.get('/api/admin/transcripts-zip', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT transcript_json, filename, session_id FROM transcripts ORDER BY saved_at DESC'
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No transcripts found' });
    }

    const zipName = `cme_transcripts_${new Date().toISOString().slice(0, 10)}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => { throw err; });
    archive.pipe(res);

    for (const row of result.rows) {
      const fname = row.filename || `interview_${row.session_id}.json`;
      archive.append(JSON.stringify(row.transcript_json, null, 2), { name: fname });
    }

    archive.finalize();
  } catch (error) {
    console.error('ZIP error:', error);
    res.status(500).json({ error: 'Failed to create ZIP: ' + error.message });
  }
});

// Send test email
app.post('/api/admin/test-email', requireAdmin, async (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!emailUser || !emailPass || !adminEmail) {
    return res.status(400).json({ error: 'Email not fully configured. Check EMAIL_USER, EMAIL_PASSWORD, and ADMIN_EMAIL.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    await transporter.sendMail({
      from: emailUser,
      to: adminEmail,
      subject: 'CME Interviewer — Test Notification',
      text: [
        'This is a test notification from the CME Event Platform Requirements Interviewer.',
        '',
        'Email notifications are working correctly.',
        '',
        'You will receive a message like this each time a participant completes an interview.',
        '',
        `Sent to: ${adminEmail}`,
        `Sent at: ${new Date().toLocaleString('en-CA')}`
      ].join('\n')
    });

    res.json({ success: true, sentTo: adminEmail });
  } catch (err) {
    console.error('Test email failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin status (check config)
app.get('/api/admin/status', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS cnt FROM transcripts');
    res.json({
      transcriptCount: parseInt(result.rows[0].cnt),
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.ADMIN_EMAIL),
      adminEmail: process.env.ADMIN_EMAIL || null,
      systemPromptLoaded: !!loadSystemPrompt()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ── Start server (local) or export for Vercel ─────────────────────────────

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CME Event Platform Interviewer running on port ${PORT}`);
    const prompt = loadSystemPrompt();
    const kb = loadKnowledgeBase();
    console.log(prompt
      ? `System prompt loaded (${prompt.length} chars) + Knowledge base (${kb ? kb.length : 0} chars) = ${(prompt.length + (kb ? kb.length : 0)).toLocaleString()} chars total context`
      : `WARNING: System prompt not found at ${SYSTEM_PROMPT_PATH}`);
    console.log(process.env.ANTHROPIC_API_KEY ? 'Anthropic API key: configured' : 'WARNING: ANTHROPIC_API_KEY not set');
    console.log(process.env.ADMIN_PASSWORD ? 'Admin password: configured' : 'WARNING: ADMIN_PASSWORD not set — admin panel disabled');
    console.log(process.env.ADMIN_EMAIL ? `Notifications → ${process.env.ADMIN_EMAIL}` : 'Email notifications: not configured');
  });
}

module.exports = app;
