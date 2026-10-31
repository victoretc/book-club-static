// Нижнее меню (bottom-nav.html): плавающая панель внизу экрана.
//
// Показ — только когда шапка ушла из вида («второй экран»): наблюдаем
// IntersectionObserver за первым .header на странице. На главной шапок
// две (вторая открывает каталог) — смотрим на первую: как только она
// перестаёт пересекаться с вьюпортом, панель показывается; возврат
// к первому экрану прячет её обратно.
//
// «Избранное» на страницах без каталога (клуб, блог, категории): ссылка
// ведёт в каталог, а флаг в sessionStorage просит catalog.js открыть его
// сразу в режиме избранного. На страницах с каталогом фильтром владеет
// catalog.js (кнопка несёт data-fav-toggle).
// Без JS панель остаётся в hidden — сайт полностью работаем без неё.
;(function () {
  var nav = document.querySelector('[data-bnav]')
  if (!nav) return

  var favBtn = nav.querySelector('[data-bnav-fav]')
  if (favBtn) {
    favBtn.addEventListener('click', function () {
      // Каталог на странице есть — навигацию и фильтр гасит catalog.js,
      // флаг не нужен.
      if (document.querySelector('[data-catalog-list]')) return
      try {
        sessionStorage.setItem('book_club_fav_open', '1')
      } catch (e) {}
    })
  }

  // ===== Показ/скрытие по видимости шапки =====
  var header = document.querySelector('.header')
  if (!header || !('IntersectionObserver' in window)) {
    // Нет шапки (страница без chrome) или нет IO — показываем всегда.
    nav.hidden = false
    return
  }

  var observer = new IntersectionObserver(function (entries) {
    nav.hidden = entries[0].isIntersecting
  })
  observer.observe(header)
})()
