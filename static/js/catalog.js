// Каталог клубов: поиск (debounce 200ms), фильтр по типу, режим grid/list,
// избранное в localStorage (как в victors-blog), sticky-градиент, «Наверх».
// Повторяет поведение ClubCards/ClubFilters из book-club-web.
;(function () {
  var list = document.querySelector('[data-catalog-list]')
  if (!list) return

  // Фильтрация прячет обёртку: внутри неё лежит ссылка на клуб и кнопка
  // избранного, и прятать нужно и то и другое разом.
  var wraps = Array.prototype.slice.call(list.querySelectorAll('.club-card-wrap'))
  var cards = wraps.map(function (wrap) {
    return wrap.querySelector('.club-card')
  })
  var input = document.querySelector('[data-catalog-search]')
  var searchBtn = document.querySelector('[data-catalog-search-btn]')
  var typeTabs = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'))
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll('[data-view-mode]'))
  var empty = document.querySelector('[data-catalog-empty]')
  var favEmpty = document.querySelector('[data-fav-empty]')
  var authorEmpty = document.querySelector('[data-author-empty]')
  var filtersSection = document.querySelector('.filters-section')
  var scrollTopBtn = document.querySelector('[data-scroll-top]')

  var activeType = 'book'
  var query = ''
  var debounceTimer = null

  // === Избранное (localStorage, не сервер: избранное принадлежит браузеру) ===
  // В хранилище лежит список RelPermalink — по ним же кнопки находят свой клуб.
  // Обёртки try/catch: в приватном режиме запись запрещена, и фильтр должен
  // работать в рамках сессии, просто не переживая перезагрузку.
  var STORAGE_KEY = 'book_club_favorites'

  function loadFavorites() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return Array.isArray(parsed)
        ? parsed.filter(function (item) { return typeof item === 'string' })
        : []
    } catch (e) {
      return []
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (e) {
      // Ничего: сессионное избранное всё равно работает.
    }
  }

  var favorites = loadFavorites()
  // Режим «только избранное» — третий, независимый от типа и запроса фильтр.
  var favOnly = false
  var favToggles = Array.prototype.slice.call(document.querySelectorAll('[data-fav-toggle]'))
  var favButtons = Array.prototype.slice.call(list.querySelectorAll('[data-fav-btn]'))

  function applyFilters() {
    var q = query.trim().toLowerCase()
    // Таб «Авторские» — заглушка: клубы не фильтруются, вместо сетки
    // показывается блок «Раздел пока не реализован».
    var authorMode = activeType === 'author'
    var visible = 0

    wraps.forEach(function (wrap) {
      var typeOk = !authorMode && wrap.getAttribute('data-type') === activeType
      var searchOk = !q || (wrap.getAttribute('data-search') || '').indexOf(q) !== -1
      var url = wrap.getAttribute('data-url')
      var favOk = !favOnly || favorites.indexOf(url) !== -1
      var show = typeOk && searchOk && favOk
      wrap.style.display = show ? '' : 'none'
      if (show) visible += 1
    })

    // В режиме избранного пустая сетка — это «ещё ничего не сохранили»,
    // а не «ничего не найдено»: картинка 404 здесь врала бы.
    if (empty) empty.hidden = visible !== 0 || favOnly || authorMode
    if (favEmpty) favEmpty.hidden = visible !== 0 || !favOnly || authorMode
    if (authorEmpty) authorEmpty.hidden = !authorMode
    // Пустой список нельзя оставлять в потоке: он нулевой высоты, но gap
    // колонки (24px) всё равно тянет блок пустого состояния ниже сайдбара.
    if (list) list.hidden = visible === 0
  }

  // === Уведомление о добавлении/удалении ===
  var toast = document.querySelector('[data-fav-toast]')
  var toastText = toast ? toast.querySelector('[data-toast-text]') : null
  var toastTimer = null

  function showToast(kind) {
    if (!toast || !toastText) return
    toastText.textContent =
      kind === 'remove' ? toast.getAttribute('data-text-removed') : toast.getAttribute('data-text-added')
    toast.classList.add('is-visible')
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible')
    }, 2600)
  }

  function renderFavorites() {
    favButtons.forEach(function (button) {
      var wrap = button.closest('.club-card-wrap')
      var active = favorites.indexOf(wrap.getAttribute('data-url')) !== -1
      button.setAttribute('aria-pressed', active ? 'true' : 'false')
      button.setAttribute(
        'aria-label',
        active ? button.getAttribute('data-label-remove') : button.getAttribute('data-label-add')
      )
    })
  }

  // Кнопка избранного лежит поверх ссылки, а не внутри её, но на всякий
  // случай клик перехватывается: переход по карточке не должен срабатывать.
  list.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-fav-btn]') : null
    if (!button) return

    event.preventDefault()
    event.stopPropagation()

    var wrap = button.closest('.club-card-wrap')
    var url = wrap.getAttribute('data-url')
    var wasFavorite = favorites.indexOf(url) !== -1

    favorites = wasFavorite
      ? favorites.filter(function (item) { return item !== url })
      : favorites.concat([url])

    saveFavorites()
    renderFavorites()
    showToast(wasFavorite ? 'remove' : 'add')

    // В режиме избранного снятие сердечка сразу убирает карточку — иначе
    // она останется в ленте до следующего фильтра.
    if (favOnly) applyFilters()
  })

  // Чекбокс в сайдбаре и таблетка на мобильном — один фильтр, поэтому клик
  // по любой из них синхронизирует обе.
  function syncFavToggles() {
    favToggles.forEach(function (toggle) {
      if (toggle.type === 'checkbox') {
        toggle.checked = favOnly
      } else {
        // Таблетка — обычный чип, поэтому живёт на тех же классах, что и
        // категории: .chip--active даёт и заливку, и исключение из :hover.
        toggle.classList.toggle('chip--active', favOnly)
        toggle.setAttribute('aria-pressed', favOnly ? 'true' : 'false')
      }
    })
  }

  favToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      favOnly = !favOnly
      syncFavToggles()
      applyFilters()
    })
  })

  renderFavorites()

  function setActiveTab(tab) {
    typeTabs.forEach(function (t) {
      var on = t === tab
      t.classList.toggle('active', on)
      t.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    activeType = tab.getAttribute('data-type-filter')
    applyFilters()
  }

  typeTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setActiveTab(tab)
    })
  })

  if (input) {
    input.addEventListener('input', function () {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(function () {
        query = input.value
        applyFilters()
      }, 200)
    })

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        if (debounceTimer) clearTimeout(debounceTimer)
        query = input.value
        applyFilters()
      }
    })
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', function () {
      if (debounceTimer) clearTimeout(debounceTimer)
      query = input ? input.value : ''
      applyFilters()
    })
  }

  // === Режим grid / list (useClubsView, localStorage clubs-view-mode) ===
  var savedMode = 'grid'
  try {
    savedMode = localStorage.getItem('clubs-view-mode') || 'grid'
  } catch (e) {}

  function setViewMode(mode) {
    var isGrid = mode !== 'list'
    list.classList.toggle('clubs-list--grid', isGrid)
    cards.forEach(function (card) {
      if (card) card.classList.toggle('club-card--grid', isGrid)
    })
    viewBtns.forEach(function (btn) {
      var on = btn.getAttribute('data-view-mode') === (isGrid ? 'grid' : 'list')
      btn.classList.toggle('active', on)
      btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    try {
      localStorage.setItem('clubs-view-mode', isGrid ? 'grid' : 'list')
    } catch (e) {}
  }

  viewBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setViewMode(btn.getAttribute('data-view-mode'))
    })
  })

  setViewMode(savedMode)

  // === is-sticky (градиент под липкими фильтрами) ===
  if (filtersSection) {
    var onStickyScroll = function () {
      filtersSection.classList.toggle(
        'is-sticky',
        filtersSection.getBoundingClientRect().top <= 0
      )
    }
    window.addEventListener('scroll', onStickyScroll, { passive: true })
    onStickyScroll()
  }

  // === Кнопка «Наверх»: показ после 60% высоты экрана ===
  if (scrollTopBtn) {
    var onScrollTop = function () {
      scrollTopBtn.hidden = window.scrollY <= window.innerHeight * 0.6
    }
    window.addEventListener('scroll', onScrollTop, { passive: true })
    onScrollTop()
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // === Первичная фильтрация: по умолчанию таб «По книге» ===
  var initialTab = typeTabs.filter(function (t) {
    return t.classList.contains('active')
  })[0]
  setActiveTab(initialTab || typeTabs[0])
})()
