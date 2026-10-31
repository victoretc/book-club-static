// «Поделиться» на странице клуба: на мобильных — нативный navigator.share,
// на десктопе — поповер с Telegram и копированием ссылки. Тост «Ссылка
// скопирована» переиспользует разметку .fav-toast из каталога.
;(function () {
  var root = document.querySelector('[data-share]')
  if (!root) return

  var button = root.querySelector('[data-share-btn]')
  var panel = root.querySelector('[data-share-panel]')
  var copyBtn = root.querySelector('[data-share-copy]')
  var toast = document.querySelector('[data-fav-toast]')
  var toastText = toast ? toast.querySelector('[data-toast-text]') : null
  var toastTimer = null
  if (!button || !panel) return

  var url = root.getAttribute('data-url') || location.href
  var title = root.getAttribute('data-title') || document.title

  var tg = panel.querySelector('[data-share-telegram]')
  if (tg) {
    tg.href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title)
  }

  function setOpen(open) {
    panel.classList.toggle('is-open', open)
    button.setAttribute('aria-expanded', open ? 'true' : 'false')
  }

  function isOpen() {
    return panel.classList.contains('is-open')
  }

  function showToast(text) {
    if (!toast || !toastText) return
    toastText.textContent = text
    toast.classList.add('is-visible')
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible')
    }, 2000)
  }

  function copyLink() {
    function done() {
      showToast('Ссылка скопирована')
      setOpen(false)
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () {
        window.prompt('Скопируйте ссылку вручную:', url)
      })
    } else {
      window.prompt('Скопируйте ссылку вручную:', url)
    }
  }

  button.addEventListener('click', function (event) {
    event.stopPropagation()
    // Нативный шит — на устройствах, где он есть; десктопный Chromium
    // шит умеет, но без приложений список пуст, поэтому десктоп
    // (без touch) всегда открывает поповер.
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0
    if (isTouch && navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {
        // Пользователь закрыл шит — молча.
      })
      return
    }
    setOpen(!isOpen())
  })

  if (copyBtn) copyBtn.addEventListener('click', copyLink)

  document.addEventListener('click', function (event) {
    if (!root.contains(event.target)) setOpen(false)
  })

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false)
      button.focus()
    }
  })
})()
