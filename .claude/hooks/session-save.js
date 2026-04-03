#!/usr/bin/env node
/**
 * session-save.js
 * Her 5 user mesajında tetiklenir.
 * Aktif session'ın .jsonl dosyasını okur, tüm konuşmayı birebir markdown olarak yazar,
 * ~/claude-memory-repo/ içine kaydeder ve GitHub'a push eder.
 */

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const { execSync } = require("child_process");
const readline = require("readline");

const MEMORY_REPO = path.join(os.homedir(), "claude-memory-repo");
const PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects", "C--Users-salih");
const COUNTER_FILE = path.join(os.homedir(), ".claude", "msg-count.json");

// ── Sayaç oku / güncelle ─────────────────────────────────────────────────────
function getCounter() {
  try { return JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8")); }
  catch { return { count: 0, sessionId: null }; }
}
function saveCounter(data) {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data));
}

// ── Aktif session .jsonl dosyasını bul ──────────────────────────────────────
function findLatestSession() {
  if (!fs.existsSync(PROJECTS_DIR)) return null;
  const files = fs.readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith(".jsonl") && !f.startsWith("agent-"))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(PROJECTS_DIR, f)).mtimeMs
    }))
    .sort((a, b) => b.time - a.time);
  return files[0]?.name.replace(".jsonl", "") || null;
}

// ── .jsonl'den konuşmayı parse et ───────────────────────────────────────────
function parseConversation(sessionId) {
  const filePath = path.join(PROJECTS_DIR, `${sessionId}.jsonl`);
  if (!fs.existsSync(filePath)) return [];

  const lines = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean);
  const messages = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === "user" && entry.message?.role === "user") {
        const content = entry.message.content;
        const text = Array.isArray(content)
          ? content.filter(c => c.type === "text").map(c => c.text).join("\n")
          : typeof content === "string" ? content : "";
        if (text.trim()) messages.push({ role: "user", text, timestamp: entry.timestamp });
      } else if (entry.type === "assistant" && entry.message?.role === "assistant") {
        const content = entry.message.content;
        const text = Array.isArray(content)
          ? content.filter(c => c.type === "text").map(c => c.text).join("\n")
          : typeof content === "string" ? content : "";
        if (text.trim()) messages.push({ role: "assistant", text, timestamp: entry.timestamp });
      }
    } catch { /* skip malformed lines */ }
  }
  return messages;
}

// ── Markdown oluştur ─────────────────────────────────────────────────────────
function buildMarkdown(sessionId, messages) {
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  let md = `# Session: ${sessionId}\n`;
  md += `**Saved:** ${date}\n`;
  md += `**Messages:** ${messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of messages) {
    const time = msg.timestamp ? new Date(msg.timestamp).toISOString().slice(11, 19) : "";
    if (msg.role === "user") {
      md += `## 👤 Salih ${time ? `(${time})` : ""}\n\n`;
    } else {
      md += `## 🤖 Claude ${time ? `(${time})` : ""}\n\n`;
    }
    md += `${msg.text}\n\n`;
    md += `---\n\n`;
  }
  return md;
}

// ── GitHub'a push ────────────────────────────────────────────────────────────
function pushToGitHub(sessionId, markdown) {
  if (!fs.existsSync(MEMORY_REPO)) {
    console.error("claude-memory-repo not found at", MEMORY_REPO);
    return false;
  }

  const date  = new Date().toISOString().slice(0, 10);
  const fname = `${date}-${sessionId.slice(0, 8)}.md`;
  const fpath = path.join(MEMORY_REPO, fname);

  fs.writeFileSync(fpath, markdown, "utf8");

  try {
    execSync(`cd "${MEMORY_REPO}" && git add "${fname}" && git commit -m "session ${sessionId.slice(0, 8)} — ${new Date().toISOString().slice(0, 16)}" && git push origin main`, {
      stdio: "pipe"
    });
    return true;
  } catch (e) {
    console.error("git push failed:", e.message);
    return false;
  }
}

// ── Ana akış ─────────────────────────────────────────────────────────────────
async function main() {
  // stdin'den event oku
  const rl = readline.createInterface({ input: process.stdin });
  let inputData = "";
  for await (const line of rl) inputData += line + "\n";

  let event = {};
  try { event = JSON.parse(inputData); } catch {}

  // Sayaç güncelle
  const state = getCounter();
  state.count = (state.count || 0) + 1;

  const sessionId = findLatestSession();
  if (sessionId) state.sessionId = sessionId;

  saveCounter(state);

  // Her 5 mesajda tetikle
  if (state.count % 5 !== 0) {
    process.exit(0);
  }

  if (!state.sessionId) process.exit(0);

  // Konuşmayı oku ve kaydet
  const messages = parseConversation(state.sessionId);
  if (messages.length === 0) process.exit(0);

  const markdown = buildMarkdown(state.sessionId, messages);
  const pushed = pushToGitHub(state.sessionId, markdown);

  if (pushed) {
    // Claude'a bildir
    const date  = new Date().toISOString().slice(0, 10);
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: `\n[HAFIZA KAYDI] Bu session GitHub'a kaydedildi: https://github.com/salihdemirci03/claude-memory/${date}-${state.sessionId.slice(0, 8)}.md`
      }
    }));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
