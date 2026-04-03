#!/usr/bin/env node
/**
 * prompt-enricher.js
 * UserPromptSubmit hook — tüm skill'leri tarar, en uygunlarını seçer,
 * Salih'in prompt'unu zenginleştirir ve Claude'a öyle iletir.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

// ── Tüm skill'leri tara ──────────────────────────────────────────────────────

function loadSkills() {
  const skillsDir = path.join(os.homedir(), ".claude", "skills");
  const skills = [];

  if (!fs.existsSync(skillsDir)) return skills;

  // gstack skill'leri: her alt klasördeki SKILL.md
  const gstackDir = path.join(skillsDir, "gstack");
  if (fs.existsSync(gstackDir)) {
    const entries = fs.readdirSync(gstackDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(gstackDir, entry.name, "SKILL.md");
      if (!fs.existsSync(skillMd)) continue;

      const content = fs.readFileSync(skillMd, "utf8");
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const descMatch = content.match(/^description:\s*\|?\n([\s\S]*?)(?=\n\w|\n---)/m);

      if (!nameMatch) continue;
      const name = nameMatch[1].trim();
      const desc = descMatch
        ? descMatch[1].replace(/^\s+/gm, "").trim()
        : "";

      skills.push({ name: `/${name}`, source: "gstack", desc, raw: content });
    }
  }

  // everything-claude-code ve diğer skill paketleri
  const ecc = path.join(
    os.homedir(),
    ".claude",
    "plugins",
    "everything-claude-code@everything-claude-code",
    "skills"
  );
  if (fs.existsSync(ecc)) {
    const entries = fs.readdirSync(ecc, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(ecc, entry.name, "SKILL.md");
      if (!fs.existsSync(skillMd)) continue;
      const content = fs.readFileSync(skillMd, "utf8");
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const descMatch = content.match(/^description:\s*\|?\n([\s\S]*?)(?=\n\w|\n---)/m);
      if (!nameMatch) continue;
      const name = nameMatch[1].trim();
      const desc = descMatch ? descMatch[1].replace(/^\s+/gm, "").trim() : "";
      skills.push({ name: `/${name}`, source: "ecc", desc, raw: content });
    }
  }

  return skills;
}

// ── Keyword eşleştirme ───────────────────────────────────────────────────────

const INTENT_MAP = [
  // Planning
  { keywords: ["fikr", "idea", "yapmak istiyorum", "nasıl yapayım", "ne yapsam", "proje", "başlayalım", "yeni bir"], skills: ["/office-hours", "/autoplan"] },
  { keywords: ["plan", "mimari", "architecture", "tasarla", "design system", "yapı"], skills: ["/autoplan", "/plan-eng-review"] },
  { keywords: ["ceo review", "scope", "genişlet", "daralt", "ürün"], skills: ["/plan-ceo-review"] },

  // Design
  { keywords: ["ui", "ux", "tasarım", "design", "görsel", "arayüz", "landing", "sayfa tasarımı"], skills: ["/design-consultation", "/design-review"] },
  { keywords: ["birkaç versiyon", "alternatif tasarım", "a/b", "farklı seçenek"], skills: ["/design-shotgun"] },
  { keywords: ["html", "responsive", "production html", "css"], skills: ["/design-html"] },

  // Dev & Review
  { keywords: ["incele", "review", "pr", "merge", "diff", "kod kalitesi", "kontrol et"], skills: ["/review"] },
  { keywords: ["bug", "hata", "çalışmıyor", "debug", "neden", "sorun", "fix"], skills: ["/investigate"] },
  { keywords: ["ikinci görüş", "codex", "başka model", "cross-model"], skills: ["/codex"] },

  // Test & QA
  { keywords: ["test et", "qa", "tarayıcıda", "kullanıcı akışı", "browser test", "dene"], skills: ["/qa"] },
  { keywords: ["sadece raporla", "fix etme", "bug listesi", "qa-only"], skills: ["/qa-only"] },
  { keywords: ["performans", "hız", "yüklenme", "core web vitals", "benchmark"], skills: ["/benchmark"] },
  { keywords: ["deploy sonrası", "canlı izle", "canary", "monitoring"], skills: ["/canary"] },

  // Shipping
  { keywords: ["yayınla", "ship", "push", "deploy", "pr aç", "gönder"], skills: ["/ship"] },
  { keywords: ["merge et", "canlıya al", "production", "land"], skills: ["/land-and-deploy"] },
  { keywords: ["readme güncelle", "dokümantasyon", "changelog", "docs"], skills: ["/document-release"] },
  { keywords: ["retro", "haftalık özet", "ne yaptık", "bu hafta"], skills: ["/retro"] },

  // Browser
  { keywords: ["siteye gir", "browser", "chrome", "web'de", "scrape", "tarayıcı", "navigate"], skills: ["/browse"] },

  // Security
  { keywords: ["güvenlik", "security", "owasp", "açık", "vulnerability", "hack", "penetrasyon"], skills: ["/cso"] },

  // Safety
  { keywords: ["sil", "drop", "rm -rf", "force push", "tehlikeli"], skills: ["/careful", "/guard"] },

  // Health
  { keywords: ["sağlık", "health", "lint", "type check", "kalite dashboard"], skills: ["/health"] },
];

function matchSkills(prompt, allSkills) {
  const lower = prompt.toLowerCase();
  const matched = new Set();

  for (const intent of INTENT_MAP) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      intent.skills.forEach((s) => matched.add(s));
    }
  }

  // Eşleşen skill'lerin tam tanımlarını bul
  const result = [];
  for (const skillName of matched) {
    const found = allSkills.find((s) => s.name === skillName);
    if (found) result.push(found);
    else result.push({ name: skillName, source: "gstack", desc: "" });
  }

  return result;
}

// ── Prompt zenginleştirme ────────────────────────────────────────────────────

function enrichPrompt(userPrompt, matchedSkills) {
  if (matchedSkills.length === 0) return null; // Değişiklik yok

  const skillList = matchedSkills
    .map((s) => {
      const shortDesc = s.desc.split("\n")[0].slice(0, 100);
      return `- ${s.name}${shortDesc ? ": " + shortDesc : ""}`;
    })
    .join("\n");

  const invocations = matchedSkills.map((s) => s.name).join(", ");

  return `[SKILL ROUTER] Bu görev için en uygun skill'ler tespit edildi:
${skillList}

Önce şu skill'leri çalıştır: ${invocations}
Sonra kullanıcının orijinal isteğini tamamla.

Kullanıcının isteği:
${userPrompt}`;
}

// ── Ana akış ─────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let inputData = "";

  for await (const line of rl) {
    inputData += line + "\n";
  }

  let event;
  try {
    event = JSON.parse(inputData);
  } catch {
    process.exit(0);
  }

  const userPrompt = event?.prompt || "";
  if (!userPrompt.trim()) process.exit(0);

  const allSkills = loadSkills();
  const matched = matchSkills(userPrompt, allSkills);
  const enriched = enrichPrompt(userPrompt, matched);

  if (enriched) {
    // Hook çıktısı: prompt'u değiştir
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: `\n\n[AUTO-ROUTING] Tespit edilen skill'ler: ${matched.map((s) => s.name).join(", ")}\nBu skill'leri otomatik çalıştır, kullanıcıdan tekrar sormana gerek yok.`,
        },
      })
    );
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
