#!/bin/bash
# Realm of Shadows — Project Bootstrap
# Run: chmod +x bootstrap.sh && ./bootstrap.sh

set -e

echo "⚔️  Initializing Realm of Shadows..."

# Create Vite + React + TypeScript project
npm create vite@latest realm-of-shadows -- --template react-ts
cd realm-of-shadows

# Install dependencies
npm install zustand howler
npm install -D @types/howler

# Create directory structure
mkdir -p src/{engine,entities/enemies,entities/npcs,levels/tilesets,systems,ui,art/{characters,tilesets,effects,ui,backgrounds},audio,stores}

# Copy CLAUDE.md and agents
cp ../CLAUDE.md ./CLAUDE.md
cp -r ../.claude ./.claude

# Setup Google Fonts in index.html
sed -i 's|</head>|    <link href="https://fonts.googleapis.com/css2?family=MedievalSharp\&family=Crimson+Text:ital,wght@0,400;0,600;1,400\&display=swap" rel="stylesheet">\n  </head>|' index.html

# Create CSS variables file
cat > src/theme.css << 'EOF'
:root {
  --bg-deep: #0a0a12;
  --bg-mid: #14141e;
  --stone: #2a2a3a;
  --stone-light: #3a3a4e;
  --gold: #c9a030;
  --gold-dim: #8a6e20;
  --blood: #8b1a1a;
  --blood-bright: #cc2a2a;
  --magic: #4a6fa5;
  --magic-glow: #6a8fc5;
  --poison: #3a6b35;
  --text: #d4c9a8;
  --text-dim: #8a8070;
  --outline: #1a1a2e;

  --font-display: 'MedievalSharp', cursive;
  --font-body: 'Crimson Text', serif;

  --tile-size: 48px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--bg-deep);
  color: var(--text);
  font-family: var(--font-body);
  overflow: hidden;
}
EOF

echo ""
echo "✅ Project ready!"
echo ""
echo "Next steps:"
echo "  cd realm-of-shadows"
echo "  claude   # Start Claude Code CLI"
echo ""
echo "Suggested first prompt:"
echo '  "Read CLAUDE.md. Start with Phase 1: build the game engine core'
echo '   (GameLoop.ts, Physics.ts, InputManager.ts, Camera.ts).'
echo '   Use @engine-agent for guidance."'
