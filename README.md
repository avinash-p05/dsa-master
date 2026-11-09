# DSA Master

A concept-first roadmap of 180 curated LeetCode problems for mid-level interviews. Each topic explains the pattern first, then lists its problems. Click a problem to solve it on LeetCode, then tick it off. Progress, notes and the 2/7/14-day review schedule are saved in the browser's localStorage. There's no backend.

Built with React 18, TypeScript, Vite and React Router (hash routing, so it runs on any static host).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Type-check and build to `dist/`      |
| `npm run preview`   | Serve the production build locally   |
| `npm run typecheck` | Run the TypeScript compiler only     |
| `npm run lint`      | Run ESLint                           |

## Project structure

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Providers + routes
├── data/
│   ├── roadmap.ts           # ✏️  Phases, topics, concepts and problems (edit this)
│   └── index.ts             # Builds numbered problems/topics + lookup helpers
├── types/                   # Shared TypeScript types (roadmap, progress)
├── lib/                     # Pure logic: review scheduling, storage, formatting, highlighting
├── context/                 # ProgressProvider (state + persistence), ToastProvider
├── hooks/                   # useProgress, useToast
├── components/
│   ├── layout/              # AppLayout, Header, ThemeToggle, ProgressMenu
│   ├── problems/            # ProblemRow, ProblemList
│   ├── topics/              # TopicCard, ConceptPanel
│   └── ui/                  # Icon, ProgressBar, ProgressRing, DifficultyPill, SegmentedControl, CodeBlock
├── pages/                   # HomePage, TopicPage, ReviewPage, GuidePage, NotFoundPage
└── styles/global.css        # Design tokens (light/dark) and component styles
```

## Editing the roadmap

Everything lives in `src/data/roadmap.ts`. Each problem is one string:

```ts
"Two Sum|two-sum|E"          // Title | LeetCode slug | E, M or H
"Meeting Rooms II|meeting-rooms-ii|M|P"   // add |P for Premium problems
```

Problem numbers are assigned automatically in roadmap order.

> Progress is keyed by problem number. If you insert a problem in the middle of the list, existing users' progress will shift. Add new problems at the end of a topic, or at the end of the roadmap.

## Deployment

Pushing to `main` builds and deploys to GitHub Pages through `.github/workflows/deploy.yml`. In the repo settings, set **Pages → Source** to **GitHub Actions**.
