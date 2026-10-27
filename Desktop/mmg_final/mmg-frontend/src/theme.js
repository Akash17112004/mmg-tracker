const THEMES = ['light', 'dark', 'contrast']

export function getTheme() {
  return localStorage.getItem('mmg_theme') || 'dark'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('mmg_theme', theme)
}

export function cycleTheme() {
  const current = getTheme()
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
  applyTheme(next)
  return next
}

export function initTheme() {
  applyTheme(getTheme())
}
