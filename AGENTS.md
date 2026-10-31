<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# StudioSpace Client

Frontend for StudioSpace. At the time of writing the app is a fresh scaffold: `src/app/page.tsx` renders an empty shell and no product features exist yet. Treat existing files as the baseline to build on, not as finished code.

## Stack

- **Next.js 16.4.3** (App Router, Turbopack, React Compiler) with **React 19.3**
- **TypeScript** strict mode, path alias `@/*` → `src/*`
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.*`) wired through `@tailwindcss/turbopack`
- **shadcn/ui "base-nova" style** built on **Base UI** (`@base-ui/react`), not Radix
- **Bun 1.4** as package manager (`bun.lock`); `better-auth`, `shiki`, `recharts`, `embla`, `cmdk`, `date-fns` are installed

## Commands

```bash
bun dev        # next dev  (writes to .next/dev, also refreshes the managed AGENTS.md block)
bun run build  # next build (Turbopack + React Compiler; runs Cache Components validation)
bun run lint   # eslint (flat config); `next lint` no longer exists
```

There is no test runner configured. Do not claim a change is verified from a passing build alone — check the page at runtime when behavior matters.

## Layout

```
src/app/            App Router: layout.tsx, page.tsx, globals.css
src/components/ui/  shadcn components (generated)
src/hooks/          use-mobile, use-highlighted-code
src/lib/            utils.ts (cn), highlighter.tsx (shiki)
```

## Conventions

### Framework config in `next.config.ts`

`cacheComponents: true`, `partialPrefetching: true`, and `reactCompiler: true` are all on. That combination changes how you must write data access:

- Uncached data read outside a `<Suspense>` boundary is a **build error**, not a warning. Fix with a Suspense boundary, `"use cache"`, or `export const instant = false` on the route.
- Cache with `"use cache"` + `cacheLife` / `cacheTag`. `revalidateTag` requires a second `cacheLife` profile argument; use `updateTag` inside Server Actions for read-your-writes.
- React Compiler is enabled, so do not add manual `useMemo` / `useCallback` for memoization by default.
- Typed route props are generated: `LayoutProps<"/">`, `PageProps<"/route/[id]">`, `RouteContext<...>`. `params` and `searchParams` are Promises — `await` them.
- Middleware is `src/proxy.ts` exporting `proxy`, not `middleware.ts`.
- `next dev` and `next build` use separate output dirs; a lockfile prevents duplicate dev servers.

### UI components

`src/components/ui/*` are shadcn-generated files. Regenerate rather than hand-edit:

```bash
bunx shadcn@latest add <component>
```

They follow the Base UI + `data-slot` pattern and accept a `className` merged with `cn`. Import `cn` from `@/lib/utils` in app code (that module re-exports the `cn` package). Styling is token-based: use the CSS variables in `src/app/globals.css` (`bg-background`, `text-muted-foreground`, `border-border`, …) instead of hard-coded colors, and `size-*` for icons so the shared `[&_svg]` rules apply.

### Syntax highlighting

`src/lib/highlighter.tsx` lazily loads a fixed set of Shiki languages through `shiki/core` with the JavaScript regex engine. To highlight a new language, add it to the `languages` map (and to `aliases` if it has short names) — do not switch to the full `shiki` bundle, which would pull every grammar into the client.

### Auth

`better-auth` is installed but not yet wired up. There is no auth route handler, client, or env file yet; add them under `src/app/api/auth/[...all]/route.ts` and `src/lib/auth-client.ts` following the Better Auth Next.js integration when the feature lands.

## Style notes

- Match the surrounding code: 2-space indent, double quotes, semicolons in `src/app`, and the existing generated components' mixed formatting — prefer not to reformat generated files.
- Server Components by default; add `"use client"` only where interactivity or browser APIs require it.
- Keep `metadata` in `src/app/layout.tsx` updated when adding real pages (it still says "Create Next App").
