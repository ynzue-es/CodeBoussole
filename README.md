# CodeBoussole 🧭

Extension VS Code qui génère du **pseudo-code détaillé** comme échafaudage temporaire avant d'écrire ton code.

## L'idée

Les assistants IA actuels (Copilot, Claude Code, Cursor) écrivent le code à ta place. C'est puissant, mais on perd le contrôle, on perd le geste, et au bout d'un moment on ne réfléchit plus vraiment à ce qu'on fait.

CodeBoussole prend le parti inverse : l'IA ne touche jamais à ton code. Elle te génère un **plan détaillé en pseudo-code**, comme des traits de construction au crayon en dessin. Tu lis le plan, tu valides la logique, tu écris le code, tu effaces les traits.

L'IA t'aide à penser. C'est toi qui écris.

## Comment ça marche

1. Place ton curseur où tu veux écrire ta logique
2. Raccourci `Cmd+Alt+P` (ou `Ctrl+Alt+P` sur Linux/Windows) → CodeBoussole insère un pseudo-code détaillé en commentaires
3. Tu lis, tu valides, tu écris ton code en dessous
4. Raccourci `Cmd+Alt+G` → tu effaces tous les traits de construction

Les commentaires générés sont préfixés avec `//~` (ou l'équivalent du langage) pour les distinguer de ta vraie documentation et permettre la suppression sélective.

Le pseudo-code est généré dans la langue de ton code (français si tu commentes en français, anglais sinon).

## Philosophie

- **Pseudo-code détaillé, pas résumé** — granularité ligne-à-ligne, le code en dessous doit être une traduction mécanique
- **Pas de devinette** — si le contexte manque, le commentaire dit `TODO: vérifier X` plutôt que d'inventer
- **Éphémère** — les commentaires sont un échafaudage, pas de la doc permanente
- **Tu gardes le contrôle** — l'extension n'écrit jamais de code exécutable

## Installation

### Depuis le Marketplace

À venir.

### Depuis les sources

```bash
git clone https://github.com/<ton-pseudo>/codeboussole.git
cd codeboussole
npm install
npm run compile
```

Puis `F5` dans VS Code pour lancer une fenêtre de test avec l'extension chargée.

## Configuration

Renseigne ta clé API Anthropic dans les paramètres VS Code :

- `codeboussole.apiKey` : ta clé `sk-ant-...`

## Licence

MIT
