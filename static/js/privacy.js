// Плашка «Мы не собираем ваши данные» внизу слева. Показывается,
// пока пользователь не нажал «Ок»; выбор запоминается в localStorage
// (один флаг, больше ничего не храним и не отправляем).
;(function () {
  var KEY = 'book_club_privacy_ok'
  var note = document.querySelector('[data-privacy-note]')
  if (!note) return

  try {
    if (localStorage.getItem(KEY) === '1') return
  } catch (e) {
    // localStorage недоступен — показываем плашку каждый раз.
  }

  note.hidden = false

  var ok = note.querySelector('[data-privacy-ok]')
  if (!ok) return
  ok.addEventListener('click', function () {
    note.hidden = true
    try {
      localStorage.setItem(KEY, '1')
    } catch (e) {}
  })
})()
