# Repository Guidelines

## Project Structure & Module Organization
The Astro app lives in `src`, with React islands in `src/components`, layouts in `src/layouts`, shared contexts in `src/context`, and REST/socket helpers in `src/lib`. Pages under `src/pages` map directly to routes, while static assets go in `src/assets` and public files (favicons, robots) belong in `public`. Configuration such as API endpoints or feature flags sits in `src/config`, and shared tokens/styles live in `src/styles`. Production builds emit to `dist/`; avoid editing that directory manually.

## Build, Test, and Development Commands
Run `pnpm install` once to sync dependencies. During feature work use `pnpm dev` for the Astro + Vite dev server (hot reloads at http://localhost:4321). Validate production output with `pnpm build`, then smoke-test the generated bundle via `pnpm preview`. When you need framework diagnostics, run `pnpm astro check` (or `pnpm astro lint`) for Astro’s built-in analyzers.

## Coding Style & Naming Conventions
This repo targets modern TypeScript, ES modules, and React 19. Use 2-space indentation, semicolons, and keep imports ordered: React/astro core, third-party, internal aliases (`@/components/...`). Components, layouts, and contexts use PascalCase filenames (`DashboardCard.tsx`); hooks/utilities use camelCase. Prefer `clsx` + `tailwind-merge` when composing Tailwind classes, and colocate component-specific styles in the component file instead of global sheets. Update shared breakpoints/colors only through `tailwind.config.js` and `src/styles/tokens.css`.

## Testing Guidelines
Automated tests are not wired up yet, so gate changes with `pnpm build` and targeted manual QA in `pnpm preview`. When adding coverage, favor Vitest + React Testing Library colocated in `__tests__` folders or `*.test.ts(x)` files beside the unit they verify; name suites after the component (`describe('CheckoutForm', ...)`). Capture critical flows (API clients, Zustand stores, routing guards) and document any gaps in the PR.

## Commit & Pull Request Guidelines
Recent commits are concise Spanish imperatives (`ajuste`). Keep that spirit but add context: `<scope>: <imperative summary>` (e.g., `checkout: integra validación de cupón`). Reference ticket IDs when applicable. For pull requests, include: purpose, screenshots for UI changes, API contract notes, and explicit verification steps (`pnpm build && pnpm preview`). Link any related backend MR so reviewers can test end-to-end. Never merge without at least one approving review and a green build.

## Security & Configuration Tips
Environment-specific URLs are managed via `.env*` files and helpers like `update-api-urls.sh`; do not hardcode credentials in `src/config`. Sanitize any user-supplied data before passing it to analytics or sockets, and confirm nginx/docker settings align with the latest `.env` before deploying.
