# AI Assistant Guide

This file provides comprehensive guidance for AI coding assistants (GitHub Copilot, Claude, Kiro, Cursor, and other AI models) when working with the PThamSS codebase.

---

**Never use `npm run build` for verification** — it takes 1-2 minutes and adds no validation value.

---

## Shell Environment

**Windows PowerShell**: use `;`

**Linux/macOS/WSL**: use `&&`

<!-- examples commented out: `npm run lint; npm run test` -->

---

## Project Overview

**PThamSS** is a Japanese learning platform built with Next.js 15, React 19, and TypeScript. It provides gamified training for Hiragana, Katakana, Kanji, and Vocabulary.

| Aspect    | Technology                               |
| --------- | ---------------------------------------- |
| Framework | Next.js 15 with App Router and Turbopack |
| Language  | TypeScript (strict mode)                 |
| Styling   | Tailwind CSS + shadcn/ui                 |
| State     | Zustand with localStorage persistence    |
| i18n      | next-intl (namespace-based)              |
| Testing   | Vitest with jsdom                        |

**URLs**: [www.pthamnihongo.site](https://www.pthamnihongo.site) · [GitHub](https://github.com/tmondu/nihongoWeb)

---

## Architecture — feature-based (short)

PThamSS is organised by feature: app/, features/, shared/, core/. Keep business logic inside features and avoid cross-feature internal imports.

---

---

## Code style & state — quick rules

- Imports: use path aliases (`@/...`), avoid cross-feature relative imports.
- TypeScript: strict mode; fix errors; strictly NO `any` (tránh `no-explicit-any`, dùng `unknown` / generics); prefer `interface` for public APIs.
- React: KHÔNG gọi `setState` đồng bộ trong root body của `useEffect` (`react-hooks/set-state-in-effect`); hãy derive state khi render hoặc gọi trong async callback.
- Components: functional + explicit props; hooks/stores start with `use`.
- Styling: Tailwind + `cn()` for conditional classes.
- State: Zustand (persisted) for feature stores.

---

## i18n, commits & rules (compact)

- i18n: `next-intl` (namespace-based). <!-- `npm run i18n:check` instructions omitted here -->
- Git: use conventional commits `type(scope): desc` (example in repo).

### Rules summary

- Keep logic in `features/`. No cross-feature internals.
- Avoid circular deps. Use path aliases.
- Tuyệt đối KHÔNG thêm icon Sparkles (logo Gemini/AI) hoặc các logo AI vào giao diện người dùng.

### Do's / Don'ts (short)

- ✅ Use TypeScript types (không dùng `any`), path aliases, and translations.
- ❌ Don't add business logic to `app/` or create circular deps.
- ❌ Tuyệt đối KHÔNG dùng icon Sparkles (logo Gemini/AI) hay chèn logo AI vào giao diện người dùng.
- ❌ Không để lại unused imports hoặc unused variables (`@typescript-eslint/no-unused-vars`), pre-commit hook `--max-warnings=0` sẽ chặn ngay cả 1 warning nhỏ nhất.
- ❌ Không gọi `setState` đồng bộ trực tiếp trong root body của `useEffect`.
- ❌ Tránh narrow union cứng nhắc cho dynamic/extensible paths (như `canonicalPath` trong SEO components); dùng `string` để tránh lỗi TS2322 khi tạo trang mới.

### Common tasks

- New feature: create `features/NewFeature/` + `components/`, `store/`, `data/`, `lib/` and route.
- Add translations: update `core/i18n/locales/*` and validate via repo scripts when needed.
- Pre-commit check: chạy `git add .; npx lint-staged` để kiểm tra toàn bộ ESLint, Prettier và `tsc --noEmit` trước khi commit.

---

---

## Known Gotchas & Auto-fixes

### 1. `tsc --noEmit` fails on `.next/dev/types/validator.ts` during pre-commit

**Symptom**: `git commit` bị block với lỗi `TS1434 / TS1109 / TS1128` trong `.next/dev/types/`.

**Root cause**: `tsconfig.json` thiếu `.next` trong `exclude` → lint-staged check vào file auto-generated của Next.js.

**Fix**: Đảm bảo `tsconfig.json` có:

```json
"exclude": [".next", "node_modules", ...]
```

> Auto-fix: Nếu gặp lỗi này, thêm `".next"` vào `exclude` trong `tsconfig.json` ngay lập tức mà không cần hỏi.

### 2. Pre-commit ESLint chặn commit với `--max-warnings=0`

**Symptom**: Commit bị fail ở `eslint --fix --max-warnings=0`.

**Common culprits**:

- `@typescript-eslint/no-unused-vars`: Tuyệt đối dọn sạch toàn bộ import và biến không dùng (`unused imports/variables`). Không để lại import thừa (kể cả import placeholder/dummy như `Sparkles as _Forbidden`, `Plus`, `Layers`, v.v.).
- `@typescript-eslint/no-explicit-any`: Thay `any` bằng `unknown` hoặc type cụ thể / generics (VD: `Record<string, unknown>`, `Partial<State>`).
- `react-hooks/set-state-in-effect`: Không gọi `setState` đồng bộ trong root body của `useEffect`. Hãy tính toán giá trị trực tiếp (derived state) hoặc chỉ gọi `setState` bên trong async callback / event handler (`void (async () => { await Promise.resolve(); ... })()`).

### 3. `tsc --noEmit` báo TS2322 trên Shared SEO / Layout Schemas khi tạo Route mới

**Symptom**: `app/.../page.tsx` truyền `canonicalPath='/new/route'` bị lỗi `error TS2322: Type '"/new/route"' is not assignable to type ...`.

**Root cause**: Schema prop (ví dụ `DojoRouteSchemaProps['canonicalPath']`) dùng narrow string union thay vì kiểu mở rộng.

**Fix**: Đặt kiểu `canonicalPath: string;` trong shared component để các feature route mới không làm gãy toàn bộ build của dự án.

---

**Last Updated**: 2026-09-21
