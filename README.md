# dotfiles — Salih Demirci

Claude Code config, hooks, and AI tooling setup.

## What's here

```
.claude/
  CLAUDE.md              — Global Claude Code instructions + gstack skill routing
  settings.json          — Claude Code settings + UserPromptSubmit hook
  hooks/
    prompt-enricher.js   — Auto-detects intent, routes to right skill automatically
```

## Setup (new machine)

```bash
# 1. Clone dotfiles
git clone https://github.com/salihdemirci03/dotfiles.git ~/dotfiles

# 2. Copy to ~/.claude
cp -r ~/dotfiles/.claude/* ~/.claude/

# 3. Install gstack
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --no-prefix
```

## How prompt-enricher works

Every prompt you write is scanned against all installed skills.
Matching skills are auto-injected into Claude's context — no manual commands needed.

| You write | Skills activated |
|---|---|
| "kodu incele, test et, deploy et" | `/review` `/qa` `/ship` |
| "yeni SaaS fikrim var" | `/office-hours` `/autoplan` |
| "landing page tasarımı" | `/design-consultation` `/design-review` |
| "güvenlik kontrolü" | `/cso` |
| "bug var çalışmıyor" | `/investigate` |

## Add new skill routing

Edit `.claude/hooks/prompt-enricher.js`, add to `INTENT_MAP`:

```js
{ keywords: ["your keyword"], skills: ["/skill-name"] },
```
