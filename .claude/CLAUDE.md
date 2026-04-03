# Salih Demirci — Global Claude Code Config

## Identity
- Name: Salih Demirci
- GitHub: salihdemirci03
- Focus: AI agent systems, multi-agent orchestration, SaaS platforms

## Working Style
- Turkish or English based on context
- Direct, no filler, no corporate language
- "Boil the Lake" — when AI makes the marginal cost near-zero, do the complete thing

---

## gstack Skills (Garry Tan's AI Engineering Toolkit)
Installed at: `~/.claude/skills/gstack`

### Planning
- `/office-hours` — YC-style product rethinking, 6 forcing questions before writing code
- `/autoplan` — Full reviewed plan in one command (CEO + design + eng review)
- `/plan-ceo-review` — Founder product scope validation (Expansion/Hold/Reduction modes)
- `/plan-eng-review` — Architecture lock-in via ASCII diagrams, data flow, state machines
- `/plan-design-review` — Senior designer audit, detects AI-generated artifacts

### Design
- `/design-consultation` — Full design system from scratch, competitive research
- `/design-shotgun` — Multi-variant design explorer, opens browser comparison
- `/design-html` — Production HTML with Pretext computed layout
- `/design-review` — Design audit + auto-fix with before/after screenshots

### Development
- `/review` — Staff engineer code review, parallel specialist subagents (security/perf/testing)
- `/investigate` — Systematic root-cause debugging, escalates after 3 failed attempts
- `/codex` — Independent OpenAI Codex review for cross-model analysis
- `/checkpoint` — Save/restore work state

### Testing & QA
- `/qa` — Real browser testing, bug fix + regression test generation
- `/qa-only` — Bug reporting only, no code changes
- `/benchmark` — Page load, Core Web Vitals, resource size baselines
- `/canary` — Post-deployment monitoring for console errors and regressions

### Shipping
- `/ship` — Sync main, run tests, coverage audit, push, open PR
- `/land-and-deploy` — Merge PR, monitor CI/CD, deploy, verify health
- `/document-release` — Update all docs to match shipped changes
- `/retro` — Weekly retrospective with per-person breakdowns and shipping streaks

### Browser Automation
- `/browse` — Real Chromium control, ~100ms per command
- `/connect-chrome` — Chrome Side Panel extension, live action watching
- `/setup-browser-cookies` — Import authenticated sessions from Chrome/Arc/Brave

### Safety
- `/careful` — Warns before destructive commands (rm -rf, DROP TABLE, force-push)
- `/freeze` — Restrict edits to single directory during debugging
- `/guard` — Combined careful + freeze
- `/unfreeze` — Remove edit restrictions

### Security & Ops
- `/cso` — OWASP Top 10 + STRIDE threat modeling, 17 false-positive filters
- `/health` — System health check
- `/learn` — Persistent project-specific patterns and preferences
- `/setup-deploy` — One-time production deployment configuration
- `/gstack-upgrade` — Self-update mechanism

---

## Sprint Workflow
Think → Plan → Build → Review → Test → Ship → Reflect

## Ethos
1. **Boil the Lake** — Complete solution when marginal cost is near-zero
2. **Search Before Building** — Layer 1 (standards) → Layer 2 (trends) → Layer 3 (first principles)
3. **User Sovereignty** — AI recommends. User decides. Always.

---

## AUTO-ROUTING: Salih'in yazdıklarını otomatik skill'e çevir

Salih ne yazarsa yazsın, aşağıdaki kurallara göre doğru skill'i otomatik çalıştır.
Salih'in ayrıca komut yazmasına gerek yok — sen algıla ve uygula.

### Fikir / Planlama
- "bir şey yapmak istiyorum", "fikrim var", "nasıl yapayım", yeni proje/özellik başlangıcı
  → `/office-hours` çalıştır (önce soruları sor, sonra koda geç)

- "planla", "mimari", "nasıl tasarlayalım", "architecture"
  → `/autoplan` çalıştır (CEO + design + eng review tek seferde)

- "deploy nasıl olmalı", "production'a nasıl çıkalım", "release planı"
  → `/plan-eng-review` çalıştır

### Tasarım
- "tasarım yap", "UI/UX", "görsel", "landing page", "arayüz"
  → `/design-consultation` çalıştır

- "birkaç tasarım alternatifi", "farklı versiyon", "A/B tasarım"
  → `/design-shotgun` çalıştır

- "HTML yaz", "production HTML", "responsive"
  → `/design-html` çalıştır

- "tasarımı gözden geçir", "design review"
  → `/design-review` çalıştır

### Geliştirme & Kod İnceleme
- "kodu incele", "review", "PR hazır", "merge etmeden önce"
  → `/review` çalıştır

- "bug var", "hata", "çalışmıyor", "neden oluyor", "debug"
  → `/investigate` çalıştır

- "ikinci görüş", "codex ne der", "başka model"
  → `/codex` çalıştır

### Test & QA
- "test et", "tarayıcıda dene", "kullanıcı akışını test", "QA"
  → `/qa` çalıştır (gerçek browser açar, hataları bulur ve düzeltir)

- "sadece hataları bul", "fix etme sadece raporla"
  → `/qa-only` çalıştır

- "performans", "hız testi", "sayfa yüklenme süresi"
  → `/benchmark` çalıştır

### Yayına Alma
- "yayınla", "deploy et", "PR aç", "push et", "ship"
  → `/ship` çalıştır (test → push → PR otomatik)

- "merge et", "production'a çıkar", "canlıya al"
  → `/land-and-deploy` çalıştır

- "dökümanları güncelle", "README güncelle", "changelog"
  → `/document-release` çalıştır

- "bu haftayı özetle", "retro", "ne yaptık"
  → `/retro` çalıştır

### Güvenlik
- "güvenlik kontrolü", "açık var mı", "security audit", "OWASP"
  → `/cso` çalıştır

### Browser / Web Otomasyonu
- "siteye gir", "tarayıcıda aç", "scrape et", "web'de bir şey yap"
  → `/browse` çalıştır

### Güvenlik Önlemleri
- production'da çalışıyoruz, büyük değişiklik öncesi
  → `/careful` aktif tut, destructive komutlarda uyar

### Genel Kural
Eğer Salih bir şey söylüyorsa ve yukarıdaki kategorilerden birine giriyorsa:
1. Hangi skill'in devreye gireceğini söyle (1 satır)
2. Hemen çalıştır
3. Salih'in ayrıca komut yazmasını bekleme
