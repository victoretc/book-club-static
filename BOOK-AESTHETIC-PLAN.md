# Книжная эстетика — план реализации

Файл-размышления: что меняем, где и почему. Реализация идёт пункт за пунктом,
без открытия браузера — результат показывается на оценку в ответах.

## Что взято в работу (список пользователя)

1. Карточка = корешок книги: spines в сайдбаре категорий, hover — «выезд с полки».
2. Закладка-лента (ribbon) вместо сердечка у избранного + прогресс на detail.
3. Загнутый угол страницы (dog-ear) как affordance клика.
4. Полка как layout: книги разной высоты на полке.
5. Шмуцтитул: плашка-разделитель перед отзывами и на страницах категорий.
6. Буквица (drop cap) первому абзацу описания клуба на detail.
7. Колонтитул/фолиант: название клуба + номер в углу detail-карточки.
8. Разворот в меру строки: max-width ~65ch, justify, hyphens: auto.
9. Капитель/oldstyle figures для лейблов (Автор, Год, Категории).
10. Астеризм ⁂ / флерон вместо card-divider.
11. Инициалы в отзывах: буква имени читателя крупным шрифтом.
12. Хвостовик-ornament под заголовками (Drabina).
13. Кремовая бумага #F7F3EA + noise-текстура, тёплая тушь #1A1C2B.
14. Коленкор/ткань переплёта как фактура шапки.
15. New wave: акцент #A0EC06 и синий #3B3EFF, риso-тона в закладках.
16. Экслибрис-виньетка в футере как колофон: «Набрано Drabina и Handil Pro. Собрано в Hugo.»

## Текущее состояние (что уже есть)

- Токены: `--color-bg: #F2F2F4` (холодный серый), `--color-surface: #FFFFFF`,
  `--color-text: #1A1C2B` (и так тёплая тушь — просто оставляем), бренд
  `#3B3EFF`, акцент `#A0EC06`. Шрифты: Drabina (display), Handil Pro
  (heading), Inter (body), JetBrains Mono (mono — подключён в tokens, но
  woff2 нет, только fallback).
- Карточка: `.club-card` white, radius 32/24, hover = translateY(-2px)+
  shadow. Кнопка избранного — круглая с сердечком, `aria-pressed`,
  лежит в `.club-card-wrap` поверх `<a>`.
- Сайдбар: `.cat-list` — вертикальный список ссылок `.cat-item`.
- Detail: `.detail-card` white, `card-divider` = 1px линейка, отзывы —
  заголовок слева + карточки.
- Избранное: localStorage `book_club_favorites`, хранит RelPermalink.
  JS ищет `[data-fav-btn]`, читает `aria-pressed`. Пустые состояния:
  `data-fav-empty` (текст «Нажми на сердечко»).
- Шаблон: `catalog.html` (роутит home/clubs/term), `club-card.html`,
  `single.html` (detail), `term.html`, `footer.html`, `header.html`.
- Ловушки Hugo 0.150: один `return` на шаблон, `layouts/categories/term.html`,
  коллекция последним аргументом в `append`, `relURL` без ведущего слэша.

## Решения по пунктам

### 1. Корешок книги в сайдбаре (spines)

Идея: категории — это не список строк, а полка с корешками. Каждый пункт —
вертикальный «корешок» с текстом `writing-mode: vertical-rl` (читается
сверху вниз, как на настоящем корешке), разная высота у каждой книги,
активный — выдвинут из полки и залит брендом.

- Разметка: в `catalog.html` сайдбару добавить обёртку `.cat-shelf`,
  внутрь `.cat-spine` вместо/рядом с `.cat-item`.
- CSS: `.cat-spine { writing-mode: vertical-rl; text-orientation: mixed;
  padding: 14px 8px; border-radius: 6px; }`, высоты через nth-child
  (140/160/150px…), `align-items: flex-end` (все стоят на одной полке),
  под списком полка — `border-bottom` + лёгкая тень (доска).
- Активный: `translateX(6px)` (выдвинут) + бренд-заливка, белый текст.
- Hover: `translateX(4px)`.
- Текстовый дублёр для скринридеров: spine остаётся `<a>`, текст
  вертикальный читается нормально; плюс `aria-label` не нужен.

Риск: длинные названия категорий на вертикали не влезут по высоте.
Решение: max-height + `overflow: hidden`, шрифт 13px, и у нас всего
2 категории (Тестирование, Дизайн) — короткие.

### 2. Закладка-лента вместо сердечка

- `club-card.html`: заменить SVG сердечка на SVG ленты-закладки
  (прямоугольник с треугольным вырезом снизу: `M5 3h14v18l-7-4-7 4V3z`).
- Кнопка: вместо круглой — прямоугольная лента шириной 30px, торчит
  сверху карточки (как закладка, выглядывающая из книги):
  `position: absolute; top: 0; right: 24px;` высота 44px.
  - Не в избранном: серый/прозрачный фон, видна на hover (как сейчас).
  - В избранном (`aria-pressed=true`): заливка риso-акцентом
    (каждая карточка получает свой цвет из `$colors` — тот же массив,
    что у аватаров участников), лента «выезжает» выше (height 56px),
    белая иконка.
- Форма ленты: CSS `clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)`
  — треугольный вырез снизу, читается как лента.
- JS не трогаем: он работает через `aria-pressed`, он и останется.
- Текст «Нажми на сердечко» в `data-fav-empty` → «Нажми на ленточку-закладку».
- aria-label: «Добавить клуб в избранное» — оставляем (слово «избранное»
  остаётся, это термин функции, а не картинки).

Прогресс на detail: на странице клуба лента-закладка сбоку карточки,
высота = прогресс чтения. Откуда данные? `reviews[].read_pages` — максимальное
`read_pages` участников. Но total pages нет. Вариант: показывать просто
число прочитанных страниц (max read_pages) в виде ленты-флага с цифрой.
Без total процент бессмысленен — рисуем ленту с подписью «528 стр.»,
высота пропорциональна max read_pages относительно max по сайту? Нет —
проще: лента-индикатор с числом, длина = min(max_read / 600, 1) * 100%
(600 — условная «толстая книга»). Пишем в колонтитуле сайта как декоративный
флажок «самый прочитанный участник дошёл до стр. 528».

Решение: делаю на detail вертикальную ленту справа от заголовка с
`--progress` в CSS custom property, значение = max(read_pages) из отзывов,
подпись «стр. N». Прогресс в % берём от max(read_pages) * 1.15 (запас),
чтобы лента не была всегда на 100%.

### 3. Dog-ear (загнутый угол)

- На `.club-card::after` — треугольник в правом нижнем углу:
  `clip-path` не подходит (уже есть `overflow:hidden`), берём
  `::after` с `border-width` — классический приём: белый треугольник
  + тонкая тень под ним.
- Реализация: `.club-card { position: relative }` (уже relative? — нет,
  wrapper relative, card — нет → добавить), `::after { content: '';
  position: absolute; right: 0; bottom: 0; width: 24px; height: 24px;
  background: linear-gradient(225deg, var(--color-bg) 50%, rgba(0,0,0,.08) 50%);
  border-bottom-right-radius: 32px; }` — правый нижний угол выглядит
  загнутым (как у бумажной страницы).
- Загнутый угол гасит скругление: `border-bottom-right-radius: 0` на карточке.
- Кликабельность и так очевидна (вся карточка — `<a>`), dog-ear просто
  усиливает «страница → переверни».

Конфликт: у карточек в grid есть `overflow:hidden` — `::after` внутри card,
не wrap, значит обрежется? Нет: overflow обрезает детей, а `::after` с
`position:absolute` позиционируется от card и обрезается тоже. Треугольник
в правом нижнем углу лежит внутри — обрезать ему некуда. ОК.

### 4. Полка как layout (разная высота книг)

- В режиме grid: карточки разной высоты, стоящие на общей полке.
- CSS: `.clubs-list--grid` остаётся grid 2 колонки, но
  `align-items: end` (все прижаты к низу — стоят на полке), а высота
  карточки варьируется: `.club-card-wrap:nth-child(3n+1) { }` — проще
  задать `min-height` через nth-child: 260px / 240px / 280px.
- Под каждым рядом — полка: `.clubs-list--grid::after`? Нет, у grid нет
  рамок по строкам. Полка: общий `border-bottom` у `.clubs-column`? Нет.
  Вариант: тень-полка под каждой карточкой: `.club-card-wrap::after
  { content:''; position:absolute; left:8px; right:8px; bottom:-6px;
  height:6px; background: linear-gradient(...); }` — имитация доски.
  Но это на каждой карточке отдельно, смотрится как плинтус — допустимо.
- Альтернатива (выбрана): под карточкой горизонтальная «доска» —
  `box-shadow: 0 6px 0 -2px rgba(26,28,43,0.07)` на wrap.
  Разная высота = `min-height` по nth-child.

Реально: книги разной высоты в grid не работают — grid-строка растянет
всё до одной высоты. Поэтому `align-items: end` + min-height разный
дают разную высоту только если контента меньше min-height. Контент
(заголовок+описание+футер) обычно ~240px. min-height 240/260/280 —
разница видна. Но `height: 100%` у `.club-card--grid` растянет до
строки. Уберу `height:100%` в пользу `align-self: end`.

Осторожно: `height:100%` сейчас даёт одинаковые карточки в строке —
пользователь хочет разные. Убираем `height:100%`, ставим `align-items: end`
на grid, min-height по nth-child.

### 5. Шмуцтитул

- На страницах категорий (`catalog.html`, когда `$active` есть): сверху,
  перед фильтрами, плашка-титул: тонкая рамка, в центре название категории
  набором Drabina, над ней — кикер «Категория», под ней — флерон-ornament.
  Это и есть шмуцтитул (полутитульная страница книги).
- Перед блоком отзывов в `single.html`: `reviews` уже имеет `border-top` —
  заменяем на орнаментальный разделитель: центральный флерон `❧`/ромб
  с линиями по бокам (CSS-градиент линия + `::before/::after`).
  Заголовок «Отзывы участников» по центру, Drabina.
- Не трогаем оба `card-divider` вверху — они становятся астеризмом (п. 10).

### 6. Буквица

- `.detail-card .card-desc::first-letter`:
  `float: left; font-family: var(--font-display); font-size: 68px;
  line-height: 0.82; padding: 6px 10px 0 0; color: var(--color-brand);`
- Работает только если описание начинается с буквы (у нас все описания
  начинаются с кириллической буквы — проверено). Если начнётся с цифры
  или кавычки — `::first-letter` захватит и их, будет странно.
  Фильтр: пока игнорируем, контролируем вручную в контенте.
- `white-space: pre-line` у desc — не мешает.

### 7. Колонтитул/фолиант (running head)

- В `single.html`, в `.detail-card` сверху, перед `.card-head`:
  `<div class="running-head"><span>Название клуба</span><span>·</span><span>стр. N</span></div>`
- N — фолиант. Откуда? Порядковый номер клуба в каталоге (index + 1).
  В `single.html` нет списка всех клубов — берём `site.RegularPages`
  секции clubs, находим индекс текущей. Hugo: `where`/`range`.
  Реализация: `$all := where site.RegularPages "Section" "clubs"`,
  `$num := 1`, range — если `eq $p.RelPermalink $.RelPermalink` → `$num = add $i 1`.
  Один `return` — не используем, просто переменная.
- CSS: `font-family: mono; font-size: 11px; text-transform: uppercase;
  letter-spacing: .1em; color: muted; display:flex; justify-content: space-between;
  border-bottom: 1px dotted; padding-bottom: 8px;` — как настоящий
  колонтитул (название слева, номер справа, точечная линейка).
- На мобильном прячем номер? Нет, оставляем — он маленький.

### 8. Разворот в меру строки

- `.detail-card .card-desc`, `.review-text`:
  `max-width: 65ch; text-align: justify; hyphens: auto;`
- `hyphens: auto` требует `lang="ru"` на `<html>` — есть.
- Justify без переносов даёт дыры — `hyphens: auto` их закрывает
  (в поддерживаемых браузерах; в остальных — просто justify).
- Ограничение 65ch: карточка detail 704px, 65ch ≈ 520px при 15px —
  будет отступ справа. Это и есть «мера строки» — текст не тянется
  на всю ширину карточки. Выглядит как книжная страница внутри карточки.
- `text-justify: inter-word` — дефолт, не пишем.

### 9. Капитель/oldstyle figures для лейблов

- Лейблы: `.stat` («участник», «отзыв»), `.year-badge`, `.pages-badge`,
  `.club-type-badge`, `.card-author` (Автор), `.running-head`,
  `.footer-heading` (уже uppercase), `.sidebar-title`? — sidebar-title
  это заголовок, не лейбл, оставляем.
- CSS: класс `.label-caps` не везде подцепить — правим точечно:
  - `.year-badge`, `.pages-badge`: `font-variant: small-caps;
    letter-spacing: .06em;` — малые прописные (капитель).
  - `.stat`: `font-variant: small-caps` (текст «участник» станет капителью).
  - `font-variant-numeric: oldstyle-nums` на `.card-desc`, `.review-text`,
    `.member-count`, `.card-stats` — «старостильные» цифры (высотные,
    как в книгах), Inter их поддерживает.
- Small caps в Inter нет (Inter не имеет small-caps начертания) — браузер
  синтезирует. Синтез выглядит терпимо. Если нет — будет просто прописной
  с letter-spacing. Пишем `font-variant-caps: small-caps` — синтез ок.

### 10. Астеризм вместо card-divider

- `.card-divider` (1px линейка) → `.card-divider` становится флероном:
  `<div class="card-divider">` — в шаблоне пустой. Через `::before`
  центральный ромб + две линии по бокам:
  `background: linear-gradient(to right, transparent, stroke 40%, stroke 60%, transparent)`
  + `::after` — ромб в центре (псевдоэлемент с transform: rotate(45deg)).
- Или `content: '❧'`? Нет — глиф может не найтись в Inter → труха.
  Ромб чистым CSS надёжнее.
- Астеризм ⁂ (три звёзды) — U+2042, есть не во всех шрифтах.
  Делаем CSS-ромб (лоузенж) — это классический наборный орнамент.

### 11. Инициалы в отзывах

- `.review-text::first-letter` — та же буквица, но меньше и в другом
  стиле: `float:left; font-family: display; font-size: 44px;
  line-height: .9; margin-right: 8px; color: brand`.
- Или буква имени читателя? В шаблоне имя есть (`.reviewer-name`), но
  `::first-letter` берёт первую букву текста отзыва, а не имени.
  Чтобы буква имени — нужно оборачивать: в шаблоне, перед текстом,
  `<span class="review-initial">A</span>` = `substr $r.user 0 1`.
  Делаю это: буква имени читателя, как в книге с инициалом автора.
- Оформление: `float: left; width: 40px; height: 40px; line-height: 40px;
  text-align: center; font-family: display; font-size: 34px;
  background: brand-soft; border-radius: 8px; color: brand; margin-right: 12px;`
  — квадратная плашка-инициал (как в старых книгах — инициал в рамке).

### 12. Хвостовик-ornament под заголовками

- Под `.reviews-title`, под `.card-title` на detail, под `.sidebar-title`:
  Drabina-хвостовик — но хвостовик это не шрифт, а орнаментальная
  подчёркивающая линия с завитком.
- CSS: `::after` под заголовком: `content: ''; display: block; width: 64px;
  height: 10px; background: url(data:image/svg+xml,...) no-repeat;`
  — SVG-завиток. Либо проще: линия с наклоном + точка:
  `background: linear-gradient(to right, brand, transparent);
  clip-path: polygon(...)` — «хвост» сужается.
- Выбираю: `::after { content:''; display:block; width:72px; height:6px;
  margin-top:8px; background: var(--color-brand); clip-path: polygon(0 30%, 70% 30%, 100% 50%, 70% 70%, 0 70%); opacity:.5; }`
  — линия, сужающаяся в хвост (как перьевая черта).
- Применяю к: `.detail-card .card-title`, `.reviews-title`,
  `.sidebar-title`, `.half-title` (шмуцтитул).

### 13. Кремовая бумага + noise

- `--color-bg: #F7F3EA` (кремовая бумага).
- `--color-surface: #FFFDF7` (тёплая белая — карточки чуть теплее чистого
  белого, чтобы не резало).
- `--color-text: #1A1C2B` — уже тёплая тушь, оставляем.
- Noise: CSS-градиентный шум нельзя без картинки. Варианты:
  1. SVG-фильтр `feTurbulence` в data-URI фоном на body::before.
  2. Крошечный PNG-шум (base64).
  Делаю SVG data-URI: `body::after { content:''; position:fixed; inset:0;
  pointer-events:none; opacity:.04; background-image:url("data:image/svg+xml,...<filter><feTurbulence baseFrequency='0.8' numOctaves='3'/></filter><rect filter=.../>"); z-index: 9999; }`
  — лёгкое зерно поверх всего, `mix-blend-mode: multiply`.
  `position: fixed` + `pointer-events:none` — не мешает кликам.
- Осторожно: `z-index: 9999` поверх модалки (1100) — модалка будет под
  зерном. Зерно на 4% непрозрачности поверх модалки — не страшно,
  даже приятно (всё «на бумаге»). Но чтобы честно: ставлю z-index: 10900
  — выше модалки 1100? Модалка 1100, зерно 10900 — зерно поверх. ОК.

- `--color-bg` используется в: body, `.filters-section` sticky фон,
  `.year-badge`, `.pages-badge`, `.crumb--link:hover`,
  `.modal-close:hover`, `.card-fav`. Кремовый везде нормально.

### 14. Коленкор в шапке

- `.header` — сейчас прозрачный (фон body). Даём ему фон коленкора:
  тёмно-синий/чёрный тканый паттерн + белый текст? Нет — шапка у нас
  светлая с тёмным текстом. Коленкор = тканый переплёт, обычно тёмный.
- Вариант: тёмная коленкоровая шапка (как корешок книги) с белым
  логотипом. Меняет характер сайта сильно, но это «книжность».
- Реализация: `.header { background: #1F2133 (тёмный коленкор);
  background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 2px, transparent 2px 4px),
  repeating-linear-gradient(-45deg, ...); }` — косая тканая фактура.
  Логотип и ссылки — белые/светлые.
- Конфликт: `.crumb--link:hover { background: var(--color-bg) }` — крошки
  в контенте, не в шапке. `.header-panel a.active { background: brand-soft }`
  — панель светлая (surface), ок.
- `.header-nav-link` цвет `--color-text-secondary` → на тёмном надо
  светлый: переопределяю в блоке header: `color: rgba(255,255,255,.72)`,
  hover/active `color: #fff; background: rgba(255,255,255,.1)`.
- `.header-brand { color: #fff }`.
- `.header-burger span { background: #fff }`.
- `.header-panel` — выпадающий список, `background: surface` (светлый)
  — оставляем светлым, чтобы читалось; он лежит на тёмной шапке —
  нормально, он отдельная плашка.
- На детальной странице `.detail-back` — в контенте (не в шапке), остаётся
  тёмным.
- Также head: `--color-bg` светлый, тёмная шапка сверху — контраст
  «тёмная обложка / светлые страницы». Это и есть книжный метафора.

### 15. New wave / риso

- Уже заложено: акцент `#A0EC06` (кислотный), синий `#3B3EFF`.
- Риso-тона в закладках: у `.club-card-wrap` есть `data-` и inline-цвета
  аватаров (`$colors` — 6 пастельных пар). Для ленты-закладки берём
  насыщенные версии: массив риso-цветов в `club-card.html`:
  `#FF5C39 (orange), #2B44FF (blue), #A0EC06 (acid), #FF3D8B (pink),
  #14C4B0 (teal), #FFC300 (yellow)` — 6 штук, `mod $i`.
- Кислотный `#A0EC06` уже в tokens как `--color-accent` — используем
  для активных/выделенных элементов (активная категория на полке,
  лента в избранном).
- Карточки: заголовок набран Handil Pro (человеческий, чуть грубоватый),
  это уже «жирная обложка». Ничего дополнительно не делаем — не ломаем
  текущую систему, только добавляем риso-цвета в мелочи.

### 16. Колофон в футере

- В `footer.html`, перед `.footer-bottom`, блок:
  `<div class="colophon">` — экслибрис-виньетка (SVG: круг + книга/буква Ч)
  + текст «Набрано Drabina и Handil Pro. Собрано в Hugo.»
- SVG экслибрис: круг с двумя скрещёнными книгами или буква «Ч» в круге.
  Делаю: `<svg viewBox="0 0 40 40">` — круг, внутри стилизованная «Ч»
  (две дуги) или раскрытая книга (две страницы). Раскрытая книга
  универсальнее.
- CSS: `.colophon { display: flex; align-items: center; gap: 12px;
  justify-content: center? }` — нет, слева как футер. Но колофон
  обычно в конце, центр. Делаю центром над копирайтом, 13px, muted.

## Порядок реализации (пункт за пунктом)

1. Токены: кремовая бумага, тёплый surface, риso-цвета (п. 13, 15).
2. Noise-зерно на body (п. 13).
3. Коленкор в шапке (п. 14).
4. Spines в сайдбаре категорий (п. 1).
5. Лента-закладка вместо сердечка (п. 2).
6. Dog-ear на карточках (п. 3).
7. Полка: разная высота книг в grid (п. 4).
8. Шмуцтитул на категориях + перед отзывами (п. 5).
9. Буквица на detail (п. 6).
10. Колонтитул/фолиант на detail (п. 7).
11. Мера строки 65ch + justify + hyphens (п. 8).
12. Капитель/oldstyle figures (п. 9).
13. Флерон вместо card-divider (п. 10).
14. Инициалы в отзывах (п. 11).
15. Хвостовик под заголовками (п. 12).
16. Колофон-экслибрис в футере (п. 16).
17. Прогресс-лента на detail (п. 2b).
18. hugo --minify --gc — сборка без ошибок.

## Проверка (вместо браузера)

- `hugo --minify --gc` — без ошибок.
- grep по изменённым селекторам — что стили на месте.
- Показать диффы/файлы на оценку в ответе.
