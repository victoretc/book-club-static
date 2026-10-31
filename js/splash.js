// Сплэш загрузки: держим плашку на весь экран, пока не готовы шрифты
// (document.fonts.ready) и не загрузилась страница (window.load).
// Страховка 5 секунд — офлайн или битые шрифты не должны оставить
// плашку навсегда. Плавно гасит opacity, потом снимает элемент.
;(function () {
  var splash = document.querySelector('[data-splash]')
  if (!splash) return

  var done = false
  function hide() {
    if (done) return
    done = true
    splash.classList.add('is-done')
    setTimeout(function () {
      splash.hidden = true
    }, 300)
  }

  var fonts =
    document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve()

  var page = new Promise(function (resolve) {
    if (document.readyState === 'complete') resolve()
    else window.addEventListener('load', resolve)
  })

  Promise.all([fonts, page]).then(hide)
  setTimeout(hide, 5000)
})()
