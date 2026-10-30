// Свечение подвала (эффект Ruixen/Dia-gradient-footer, JS-перенос компонента
// в ванильный сайт: React/шадкн/Тейлворд тут не участвуют).
// Полоса [data-footer-glow] — fixed у нижней кромки экрана, высота h равна
// зарезервированному padding-bottom футера (оба — 24svh в main.css).
// t = (h - left) / h, где left — остаток прокрутки до конца страницы:
//   left > h — до футера далеко, t = 0, полоса скрыта (minReveal 0 из
//              data-min-reveal: на других страницах и в начале страницы
//              её не видно);
//   left = 0 — последний экран: t = 1, полоса во всю высоту.
// Верх полосы при любой прокрутке: vpBottom - h*t = docEnd - left - (h-left)
// = docEnd - h — это ровно верх отступа футера, поэтому свет ложится
// только в зарезервированную область и никогда не закрывает контент.
;(function () {
  var band = document.querySelector('[data-footer-glow]')
  if (!band) return

  // prefers-reduced-motion: без JS-анимации прокрутки полоса не показываем.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var minReveal = parseFloat(band.getAttribute('data-min-reveal'))
  if (isNaN(minReveal)) minReveal = 0.045

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v
  }

  function measure() {
    // offsetHeight игнорирует transform — меряем макетную высоту полосы.
    var h = band.offsetHeight || 1
    // Сколько прокрутки осталось до конца страницы.
    var left =
      document.documentElement.scrollHeight - window.innerHeight - window.scrollY
    var t = clamp01((h - left) / h)
    band.style.transform =
      'scaleY(' + (minReveal + (1 - minReveal) * t).toFixed(4) + ')'
  }

  measure()
  window.addEventListener('scroll', measure, { passive: true })
  window.addEventListener('resize', measure, { passive: true })
})()
