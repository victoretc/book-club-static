// Каталог клубов: поиск (debounce 200ms), фильтр по типу, режим grid/list,
// sticky-градиент, кнопка «Наверх». Повторяет поведение ClubCards/ClubFilters из book-club-web.
;(function () {
  var list = document.querySelector('[data-catalog-list]')
  if (!list) return

  var cards = Array.prototype.slice.call(list.querySelectorAll('.club-card'))
  var input = document.querySelector('[data-catalog-search]')
  var searchBtn = document.querySelector('[data-catalog-search-btn]')
  var typeTabs = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'))
  var viewBtns = Array.prototype.slice.call(document.querySelectorAll('[data-view-mode]'))
  var empty = document.querySelector('[data-catalog-empty]')
  var filtersSection = document.querySelector('.filters-section')
  var scrollTopBtn = document.querySelector('[data-scroll-top]')

  var activeType = 'book'
  var query = ''
  var debounceTimer = null

  function applyFilters() {
    var q = query.trim().toLowerCase()
    var visible = 0

    cards.forEach(function (card) {
      var typeOk = card.getAttribute('data-type') === activeType
      var searchOk = !q || (card.getAttribute('data-search') || '').indexOf(q) !== -1
      var show = typeOk && searchOk
      card.style.display = show ? '' : 'none'
      if (show) visible += 1
    })

    if (empty) empty.hidden = visible !== 0
  }

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
      card.classList.toggle('club-card--grid', isGrid)
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
