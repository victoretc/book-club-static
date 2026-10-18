# AGENTS.md

## Status

Hugo-сайт «Читальная» собран: каталог (`/`, `/clubs/`), карточки клубов (`/clubs/<slug>/`), категории (`/categories/<slug>/`), 404. Проверка: `hugo --minify --gc` (должно собраться без ошибок). Деплой — GH Pages через ветку `gh-pages` (`.github/workflows/deploy.yml`).

Контент клубов — `content/clubs/*.md` (front matter валидируется `errorf` в `layouts/clubs/single.html`, ошибка роняет билд). Дерево категорий — `data/categories.yml`.

### Ловушки Hugo 0.150

- `return` — только один на шаблон (множественный поддерживается с 0.166): второй `return` падает с `wrong number of args for return`. Рекурсию в шаблонах не использовать.
- Шаблон для kind=term — `layouts/categories/term.html` (`layouts/_default/term.html` и `layouts/term.html` НЕ подхватываются, молча рендерится `taxonomy.html`).
- `collections.Append ELEMENT COLLECTION` — коллекция последним аргументом.
- `--minify` удаляет HTML-комментарии (не полагаться на них в диагнозе).

## Layout

This repo (`book-club-static/`) is the Hugo static site itself. The design/architecture reference code lives behind two symlinks — **read code through these links, never via absolute `/Users/...` paths**:

| Link | Target | Role |
|---|---|---|
| `victors-blog/` | `../../opensource/victors-blog` | Architecture/tech reference: Hugo site + `frontend/` (Vue 3 + Vite + Capacitor, package `book-club-ui`), `.codegraph/` index, GH Pages deploy |
| `book-club-web/` | `../../../john/padix/tms/book-club-web` | Design/UX reference of the target app: Vue frontend + Python backend + e2e-tests + `docker-compose.local.yml` |

Both are relative and resolve from the repo root. Use them as canonical prefixes, e.g. `victors-blog/frontend/src/...`, `book-club-web/frontend/src/views/...`.

Note: `../book-club-web` (sibling of this repo) is an empty stub — not a symlink source, ignore it.

## `victors-blog/` (reference)

- `hugo.toml` + `content/ru`, `content/en` — Hugo blog, Russian default.
- `frontend/package.json` is the source of truth for commands: `dev`, `build`, `type-check` (vue-tsc), `lint` (eslint --fix), `test:unit` (vitest), `test:e2e` (playwright), `generate-api` (swagger codegen against `http://localhost:8000/api/v1/docs/schema/` — needs backend running).
- Verify with: `lint -> type-check -> test:unit` inside `victors-blog/frontend/`.
- Has a `.codegraph/` index — use `codegraph explore` instead of grep for code questions there.

## `book-club-web/` (design source)

- Screens: SignIn, ClubCards (list with categories/filters/pagination), ClubDetails (+ ClubReviews), CreateClub/EditClub, UserProfile, UserBooks, NotFound.
- Frontend stack (for reference only — the static site will NOT use it): Vue 3, Vite, Pinia, vue-router, vee-validate, Capacitor; pnpm.
- Backend is Python (docker compose + `loaddata` fixtures) — irrelevant to the static site except as a source of data/structure ideas.

When recursing (glob/grep), skip `.git/`, `public/`, `node_modules/`, `dist/`, `.playwright-mcp/` inside the links.
