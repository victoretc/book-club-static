// Нижнее меню (bottom-nav.html): плавающая панель внизу экрана.
//
// Показ — только когда шапка ушла из вида («второй экран»): наблюдаем
// IntersectionObserver за первым .header на странице. На главной шапок
// две (вторая открывает каталог) — смотрим на первую: как только она
// перестаёт пересекаться с вьюпортом, панель показывается; возврат
// к первому экрану прячет её обратно и закрывает подменю.
//
// Подменю (поиск / уведомления / профиль — демо): открытие по кнопке,
// закрытие — повторный тап, клик мимо, Escape и скрытие панели.
// Без JS панель остаётся в hidden — сайт полностью работаем без неё.
;(function () {
  var nav = document.querySelector('[data-bnav]')
  if (!nav) return

  var toggles = nav.querySelectorAll('[data-bnav-toggle]')
  var pops = nav.querySelectorAll('[data-bnav-pop]')

  function popByName(name) {
    return nav.querySelector('[data-bnav-pop="' + name + '"]')
  }

  function closeAll() {
    Array.prototype.forEach.call(pops, function (pop) {
      pop.hidden = true
    })
    Array.prototype.forEach.call(toggles, function (btn) {
      btn.setAttribute('aria-expanded', 'false')
    })
  }

  function isOpen(name) {
    var pop = popByName(name)
    return pop && !pop.hidden
  }

  Array.prototype.forEach.call(toggles, function (btn) {
    btn.addEventListener('click', function (event) {
      event.stopPropagation()
      var name = btn.getAttribute('data-bnav-toggle')
      var wasOpen = isOpen(name)
      closeAll()
      if (!wasOpen) {
        popByName(name).hidden = false
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })

  // Клики внутри панели не должны закрывать подменю (document-click ниже).
  // Кнопка «+» (data-modal-open) при этом свободно всплывает до document,
  // где её перехватывает modal.js.
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target)) closeAll()
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAll()
  })

  // ===== Показ/скрытие по видимости шапки =====
  var header = document.querySelector('.header')
  if (!header || !('IntersectionObserver' in window)) {
    // Нет шапки (страница без chrome) или нет IO — показываем всегда.
    nav.hidden = false
    return
  }

  var observer = new IntersectionObserver(function (entries) {
    var headerVisible = entries[0].isIntersecting
    nav.hidden = headerVisible
    if (headerVisible) closeAll()
  })
  observer.observe(header)
})()
