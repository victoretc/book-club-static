// Бургер-меню в шапке: две полоски складываются в крестик, панель со
// ссылками открывается классом is-open. Повторяет поведение site-nav из
// victors-blog (main.js): закрывается по клику мимо, по Escape и по
// повторному клику; состояние живёт в aria-expanded.
;(function () {
  var menu = document.querySelector('[data-header-menu]')
  if (!menu) return

  var button = menu.querySelector('[data-burger]')
  var panel = menu.querySelector('[data-burger-panel]')
  if (!button || !panel) return

  function setOpen(open) {
    panel.classList.toggle('is-open', open)
    button.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  function isOpen() {
    return panel.classList.contains('is-open')
  }

  button.addEventListener('click', function (event) {
    event.stopPropagation()
    setOpen(!isOpen())
  })

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target)) setOpen(false)
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false)
      button.focus()
    }
  })
})()
