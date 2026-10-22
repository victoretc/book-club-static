// Модалка «Добавить книгу»: открытие по клику на [data-modal-open]
// (пункты меню в шапке), закрытие — крестиком, по подложке и по Esc.
// Фокус уходит в модалку и возвращается на триггер при закрытии;
// Tab зациклен внутри. Пока модалка открыта, бургер-панель закрывается.
// Без JS ссылка спокойно ведёт на GitHub-шаблон (см. hugo.toml).
;(function () {
  var modal = document.getElementById('add-book-modal')
  if (!modal) return

  var lastTrigger = null

  function focusables() {
    return modal.querySelectorAll('a[href], button:not([disabled])')
  }

  function closeBurger() {
    var burger = document.querySelector('[data-burger]')
    var panel = document.querySelector('[data-burger-panel]')
    if (burger && panel && panel.classList.contains('is-open')) burger.click()
  }

  function open(trigger) {
    lastTrigger = trigger || null
    closeBurger()
    modal.hidden = false
    document.body.classList.add('modal-open')
    var first = focusables()[0]
    if (first) first.focus()
  }

  function close() {
    if (modal.hidden) return
    modal.hidden = true
    document.body.classList.remove('modal-open')
    if (lastTrigger) lastTrigger.focus()
    lastTrigger = null
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-modal-open]')
    if (trigger) {
      event.preventDefault()
      open(trigger)
      return
    }
    if (event.target.closest('[data-modal-close]')) close()
  })

  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return

    if (event.key === 'Escape') {
      close()
      return
    }

    if (event.key === 'Tab') {
      var items = focusables()
      if (!items.length) return
      var first = items[0]
      var last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  })
})()
