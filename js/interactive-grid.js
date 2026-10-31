// Интерактивная сетка на хиро лэндинга — порт React-компонента
// InteractiveGrid (shadcn-style) на ванильный JS: React/Tailwind/shadcn
// в этом репо нет, логика та же.
// Сетка заполняет свой positioned-родитель ([data-interactive-grid]),
// следует за указателем над ним (сам svg pointer-events: none — контент
// сверху остаётся кликабельным), ячейки берут цвет текста. Ячейка под
// указателем загорается сразу, при уходе указателя медленно гаснет.
;(function () {
  var host = document.querySelector('[data-interactive-grid]')
  if (!host || typeof ResizeObserver === 'undefined') return

  var SVG_NS = 'http://www.w3.org/2000/svg'
  var CELL = 40 // cellSize, px — как в компоненте

  var svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('data-slot', 'interactive-grid')
  svg.setAttribute('aria-hidden', 'true')
  svg.classList.add('interactive-grid')
  // Перед контентом: и по порядку, и слоем (у .landing-copy position: relative).
  host.insertBefore(svg, host.firstChild)

  var columns = 0
  var rows = 0
  var active = null // индекс активной ячейки или null
  var rects = []

  function setActive(index) {
    if (active === index) return
    if (active !== null && rects[active]) rects[active].classList.remove('is-active')
    active = index
    if (active !== null && rects[active]) rects[active].classList.add('is-active')
  }

  function build(width, height) {
    columns = Math.ceil(width / CELL)
    rows = Math.ceil(height / CELL)
    active = null

    while (svg.firstChild) svg.removeChild(svg.firstChild)
    rects = []

    var total = columns * rows
    var frag = document.createDocumentFragment()
    for (var i = 0; i < total; i++) {
      var rect = document.createElementNS(SVG_NS, 'rect')
      rect.setAttribute('x', String((i % columns) * CELL))
      rect.setAttribute('y', String(Math.floor(i / columns) * CELL))
      rect.setAttribute('width', String(CELL))
      rect.setAttribute('height', String(CELL))
      rect.setAttribute('fill', 'currentColor')
      rect.setAttribute('stroke', 'currentColor')
      rect.setAttribute('stroke-opacity', '0.1')
      frag.appendChild(rect)
      rects.push(rect)
    }
    svg.appendChild(frag)
  }

  var resizeObserver = new ResizeObserver(function () {
    var bounds = svg.getBoundingClientRect()
    var nextColumns = Math.ceil(bounds.width / CELL)
    var nextRows = Math.ceil(bounds.height / CELL)
    if (nextColumns !== columns || nextRows !== rows) {
      build(bounds.width, bounds.height)
    }
  })
  resizeObserver.observe(svg)

  function onPointerMove(event) {
    var bounds = svg.getBoundingClientRect()
    var column = Math.floor((event.clientX - bounds.left) / CELL)
    var row = Math.floor((event.clientY - bounds.top) / CELL)
    var inGrid = column >= 0 && row >= 0 && column < columns && row < rows
    setActive(inGrid ? row * columns + column : null)
  }

  function onPointerLeave() {
    setActive(null)
  }

  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerleave', onPointerLeave)
})()
