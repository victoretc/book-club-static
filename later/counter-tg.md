# План: подсчёт участников из Telegram-чатов

Источник числа участников — подписчики Telegram-чата клуба (`getChatMemberCount` через Bot API). Обновление автоматическое: cron-workflow в GitHub Actions раз в сутки кладёт числа в `data/members.yml`, шаблоны Hugo читают оттуда, деплой пересобирает сайт.

Одна техническая тонкость: коммит от `GITHUB_TOKEN` не триггерит другие workflow (защита от рекурсии), поэтому после обновления счётчиков деплой вызывается явно через `workflow_dispatch`.

## Шаг 0. Разовая настройка (вами, вне репозитория)

1. `@BotFather` → `/newbot` → получить токен.
2. Добавить бота во все 7 чатов (в группу — обычным участником, в канал — админом; на счётчик влияет только факт присутствия).
3. Репозиторий → Settings → Secrets and variables → Actions → `TELEGRAM_BOT_TOKEN`.

## Шаг 1. Скрипт `scripts/update-members.sh`

Баш + `curl` + `jq` (предустановлен на ubuntu-latest). Логика:

- Перебирает `content/clubs/*.md` (кроме `_index.md`), slug = имя файла без `.md`.
- Для каждого клуба извлекает id чата: `telegram_chat_id:` (если появится поле для приватных чатов) → иначе username из `telegram_chat_link` (`t.me/name` → `@name`). Инвайт-ссылки (`t.me/+...`) пропускаются с предупреждением — по ним id не получить.
- `GET https://api.telegram.org/bot$TOKEN/getChatMemberCount?chat_id=@name` → `jq -r .result`.
- Ошибка по одному чату → оставляем прошлое значение из `data/members.yml`, продолжаем (один сбой не роняет прогон).
- Записывает `data/members.yml` целиком: клубы без чата/без записи — omit, шаблоны фолбэчатся на ручной `members_count`.
- Пустой `TELEGRAM_BOT_TOKEN` → тихий выход 0 (чтобы воркфлоу не падал до настройки секрета).
- Локальный запуск: `TELEGRAM_BOT_TOKEN=... ./scripts/update-members.sh` — им можно проверить всё ещё до CI.

Формат `data/members.yml`:

```yaml
# Генерируется scripts/update-members.sh — не править руками
iskusstvo-testirovaniya: 12
uroki-testirovaniya: 31
```

## Шаг 2. `.github/workflows/update-members.yml` (новый)

- `on: schedule: cron: '0 6 * * *'` (06:00 UTC = 09:00 МСК, раз в сутки) + `workflow_dispatch`.
- `permissions: contents: write` + `actions: write`; `concurrency` без cancel.
- Шаги: checkout → запуск скрипта с секретом → если `data/members.yml` изменился: commit+push → `gh workflow run deploy.yml` (только после коммита; `GH_TOKEN: ${{ github.token }}`).

## Шаг 3. `deploy.yml`

Добавить триггер `workflow_dispatch:` (строки 3–6, блок `on:`) — чтобы шаг выше мог запустить деплой вручную. Остальное без изменений.

## Шаг 4. Шаблоны

`layouts/partials/club-card.html:5` и `layouts/clubs/single.html:16` — вместо прямого чтения `members_count`:

```go-html-template
{{- $n := int ($p.Params.members_count | default 0) -}}
{{- with site.Data.members -}}
  {{- if isset . $p.File.ContentBaseName -}}
    {{- $n = int (index . $p.File.ContentBaseName) -}}
  {{- end -}}
{{- end -}}
```

Приоритет: число из Telegram (data) → ручное `members_count` → 0. Валидация отрицательного числа в `single.html:16-19` остаётся, текст ошибки обобщается («счётчик участников», не привязка к полю). `member_names` не трогаем — аватарки на карточках (`club-card.html:44-51`) продолжают браться из него.

## Шаг 5. Мелочи

- `archetypes/clubs.md:14` — обновить комментарий: счётчик берётся из `data/members.yml`, `members_count` — фолбэк.
- `AGENTS.md` — короткая секция про `update-members` + готча с `GITHUB_TOKEN`/`workflow_dispatch`.

## Проверка

1. Локально: `hugo --minify --gc` — сборка без ошибок, на странице клуба число из фолбэка.
2. После настройки бота: локальный прогон скрипта с токеном → появились реальные числа в `data/members.yml`.
3. Запуск workflow вручную (Actions → Update member counts → Run) → коммит с числами → деплой прошёл → на сайте актуальные подписчики.

## Открытый момент

Текст на карточке «N участников уже читают» (`club-card.html:52`) при числе из чата станет неточным. Рекомендация — «N участников в чате» на карточке и в `single.html:107-108`. Согласны менять или оставляем как есть?
