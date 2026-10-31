// «Читать ещё» под описанием на странице клуба. Текст обрезается
// line-clamp'ом в CSS (.card-desc), кнопка нужна только если обрезка
// реально произошла — короткое описание остаётся без кнопки.
;(function () {
  var root = document.querySelector('[data-desc-expand]')
  if (!root) return

  var text = root.querySelector('[data-desc-text]')
  var btn = root.querySelector('[data-desc-toggle]')
  if (!text || !btn) return

  var open = false

  function setOpen(next) {
    open = next
    root.classList.toggle('is-open', open)
    btn.setAttribute('aria-expanded', open ? 'true' : 'false')
    btn.textContent = open ? 'Свернуть' : 'Читать ещё'
    sync()
  }

  function sync() {
    // Раскрыто — кнопка всегда видна (иначе нечем закрыть). Свёрнуто —
    // показываем, только если полный текст выше обрезанного бокса.
    btn.hidden = !open && text.scrollHeight <= text.clientHeight + 1
  }

  btn.addEventListener('click', function () {
    setOpen(!open)
  })

  sync()
  window.addEventListener('resize', sync)
  window.addEventListener('load', sync)
  // Шрифты меняют высоту строк — перепроверяем после их загрузки.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync)
})()
