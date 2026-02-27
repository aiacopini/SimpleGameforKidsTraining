# SimpleGameforKidsTraining

A collection of browser-based games and educational tools built with Canvas 2D and procedural graphics. All projects are self-contained and require no external image assets — every visual element is drawn programmatically.

## Projects

| Project | Description | Tech | How to Run |
|---------|-------------|------|------------|
| [CandyCloudRider](CandyCloudRider/) | DBZ-inspired platformer with candy theming | Vanilla JS + Canvas | Open HTML in browser |
| [DnDGame](DnDGame/) | D&D top-down dungeon crawler with 5 levels | Vanilla JS + Canvas | Open HTML in browser |
| [SpaceFun](SpaceFun/) | Classic vertical space shooter (NOVA STRIKE) | Vanilla JS + Canvas | Open HTML in browser |
| [RealmOfShadows](RealmOfShadows/) | Prince of Persia-inspired action RPG (v1) | Vanilla JS + Canvas | Open HTML in browser |
| [RealmOfShadows2](RealmOfShadows2/) | Prince of Persia side-scroller (v2, production) | React 18 + TypeScript + Vite | `npm install && npm run dev` |
| [LLMExplorer](LLMExplorer/) | Interactive LLM inference visualizer | React 18 + Recharts | Requires React tooling |
| Destroy&Discovery | Planned project | — | Not yet started |

## Common Patterns

- **Canvas 2D rendering** — all graphics are procedural (paths, fills, strokes)
- **No external assets** — no sprite sheets, no image files
- **Kid-friendly** — designed for younger audiences with accessible gameplay
- **Browser-only** — no server required for the single-file games

## Getting Started

Most games are single HTML files you can open directly in a browser. For `RealmOfShadows2`, you'll need Node.js:

```bash
cd RealmOfShadows2
npm install
npm run dev
```

## License

Private repository.
