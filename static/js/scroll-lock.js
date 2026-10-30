// Замок скролла на главной: дойдя до каталога (#catalog), колесом и пальцем
// назад — к хиро — не прокрутить. Упор — верх #catalog; вторая шапка стоит
// там в потоке (без липкости), поэтому её «Читка» остаётся на виду ровно
// у порога. Клавиатура, скроллбар и якорные ссылки не перехватываются — они
// остаются рабочими (решение по доступности; закрыть — поднять кламп в
// scroll ниже).
//
// Замок включается при первом переходе порога ВНИЗ после загрузки:
//   • свежая загрузка «/» — ушёл в каталог, назад колесом не вернёшься;
//   • заход на /#catalog со страницы клуба/категории даёт один раз
//     прокрутить вверх до хиро — замок включится при возврате вниз;
//   • перезагрузка страницы ведёт себя как заход на #catalog.
// Поэтому включение ждёт и первого действия пользователя (interacted):
// прыжок браузера к якорю #catalog не считается движением вниз.
//
// Перехват — wheel и touchmove с {passive: false}: вверх гасим только когда
// позиция вместе с дельтой упирается в порог, и подтягиваем скролл ровно
// к порогу. Иначе тачпад успевает утащить кадр в хиро раньше preventDefault.
// Дальше порога жест идёт обычным ходом — рывка «вверх на тысячи пикселей»
// не бывает. Два пальца (пинч-зум) не трогаем.
;(function () {
  var catalog = document.getElementById('catalog')
  if (!catalog) return // не главная — замок не нужен

  var threshold = 0 // верх #catalog в координатах документа, px
  var engaged = false // замок включён
  var interacted = false // пользователь уже водил вводом (см. шапку файла)
  var lastY = window.scrollY // scrollY прошлого события — ловит переход порога
  var lastTouchY = null // clientY прошлого touchmove

  function measure() {
    threshold = catalog.getBoundingClientRect().top + window.scrollY
  }

  // delta < 0 — движение вверх. true = упираемся в порог: жест гасим.
  function holds(delta) {
    if (!engaged || delta >= 0) return false
    if (window.scrollY < threshold) return false // выше порога — свободно
    if (window.scrollY + delta >= threshold) return false // порог не задет
    if (window.scrollY > threshold) window.scrollTo(0, threshold)
    return true
  }

  measure()
  window.addEventListener('resize', measure)
  window.addEventListener('load', function () {
    // Порог меряем после того, как браузер разложил страницу и применил
    // якорь #catalog; lastY = текущая позиция, чтобы сам прыжок к якорю
    // не считался переходом порога вниз.
    measure()
    lastY = window.scrollY
  })

  // Клавиатура и скроллбар замок не включают и не снимают: им можно
  // доехать до хиро, но следующий переход порога вниз вернёт упор.
  function markInteraction() {
    interacted = true
  }
  window.addEventListener('keydown', markInteraction, { passive: true })
  window.addEventListener('pointerdown', markInteraction, { passive: true })

  window.addEventListener('scroll', function () {
    var y = window.scrollY
    if (!engaged && interacted && lastY < threshold && y >= threshold) {
      engaged = true
    }
    lastY = y
  }, { passive: true })

  window.addEventListener('wheel', function (event) {
    interacted = true
    var delta = event.deltaY
    // deltaMode: 0 — пиксели, 1 — строки, 2 — страницы (так шлёт Firefox).
    if (event.deltaMode === 1) delta *= 16
    else if (event.deltaMode === 2) delta *= window.innerHeight
    if (holds(delta)) event.preventDefault()
  }, { passive: false })

  window.addEventListener('touchstart', function (event) {
    interacted = true
    lastTouchY = event.touches.length ? event.touches[0].clientY : null
  }, { passive: true })

  window.addEventListener('touchmove', function (event) {
    if (!event.touches.length) return
    var y = event.touches[0].clientY
    var prev = lastTouchY
    lastTouchY = y
    if (prev === null || event.touches.length > 1) return // пинч-зум
    // Палец вверх (clientY уменьшился) — страница едет вверх к хиро.
    if (holds(prev - y)) event.preventDefault()
  }, { passive: false })

  function touchEnd(event) {
    if (!event.touches.length) lastTouchY = null
  }
  window.addEventListener('touchend', touchEnd, { passive: true })
  window.addEventListener('touchcancel', touchEnd, { passive: true })
})()
