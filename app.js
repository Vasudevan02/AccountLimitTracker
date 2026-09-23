// ════════════════════════════════════
//  DATA
// ════════════════════════════════════
const STORAGE_KEY = 'ai_limit_trackers_v3'

const DEFAULT_DATA = [
  { id:'row-1',  email:'vasudevanvsvasu02@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-25T14:04:47', claude_status:'limited', claude_reset:'2026-09-25T18:29:31' },
  { id:'row-2',  email:'vasudevanvs290908@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-23T19:11:55', claude_status:'limited', claude_reset:'2026-09-23T19:49:14' },
  { id:'row-3',  email:'vasuvsvasudevan@gmail.com',     gemini_status:'limited', gemini_reset:'2026-09-25T16:57:08', claude_status:'limited', claude_reset:'2026-09-25T19:42:09' },
  { id:'row-4',  email:'vasudevanvasu0908@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-23T20:00:43', claude_status:'limited', claude_reset:'2026-09-25T21:43:57' },
  { id:'row-5',  email:'vsvsvs2909@gmail.com',          gemini_status:'limited', gemini_reset:'2026-09-23T20:57:53', claude_status:'limited', claude_reset:'2026-09-23T21:40:17' },
  { id:'row-6',  email:'vasudevan020202@gmail.com',     gemini_status:'limited', gemini_reset:'2026-09-23T22:02:39', claude_status:'limited', claude_reset:'2026-09-25T22:22:33' },
  { id:'row-7',  email:'dadaworldcup06@gmail.com',      gemini_status:'limited', gemini_reset:'2026-09-23T18:43:29', claude_status:'available', claude_reset:null },
  { id:'row-8',  email:'gb200809@gmail.com',            gemini_status:'limited', gemini_reset:'2026-09-28T18:03:50', claude_status:'limited', claude_reset:'2026-09-28T17:31:58' },
  { id:'row-9',  email:'vsvasudevanvasu02@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-23T22:31:54', claude_status:'limited', claude_reset:'2026-09-27T23:46:34' },
  { id:'row-10', email:'vasudevanvasuvs02@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-23T22:53:24', claude_status:'available', claude_reset:null },
  { id:'row-11', email:'godfather642614@gmail.com',     gemini_status:'limited', gemini_reset:'2026-09-25T14:58:24', claude_status:'limited', claude_reset:'2026-09-25T19:28:21' },
  { id:'row-12', email:'vasudevangoodboy02@gmail.com',  gemini_status:'limited', gemini_reset:'2026-09-28T00:11:03', claude_status:'limited', claude_reset:'2026-09-27T23:54:43' },
  { id:'row-13', email:'kirannaik05092010@gmail.com',   gemini_status:'limited', gemini_reset:'2026-09-29T13:31:29', claude_status:'limited', claude_reset:'2026-09-30T00:46:04' },
  { id:'row-14', email:'kinganna240605@gmail.com',      gemini_status:'limited', gemini_reset:'2026-09-29T15:16:42', claude_status:'limited', claude_reset:'2026-09-29T23:52:30' },
  { id:'row-15', email:'v35862294@gmail.com',           gemini_status:'limited', gemini_reset:'2026-09-30T01:16:09', claude_status:'limited', claude_reset:'2026-09-30T01:01:51' },
  { id:'row-16', email:'usingforcheatcse@gmail.com',    gemini_status:'limited', gemini_reset:'2026-09-29T22:08:00', claude_status:'limited', claude_reset:'2026-09-29T23:14:44' },
]

function load() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p }
  } catch {}
  return DEFAULT_DATA.map(d => ({ ...d }))
}
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers)) } catch {} }

let trackers = load()

// ════════════════════════════════════
//  DATE HELPERS
// ════════════════════════════════════
function fmtDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const pad = n => String(n).padStart(2, '0')
  const H = d.getHours(), mn = d.getMinutes(), sc = d.getSeconds()
  const ampm = H >= 12 ? 'PM' : 'AM'
  const h12 = H % 12 || 12
  const mo = d.getMonth() + 1, dy = d.getDate(), yr = d.getFullYear()
  return `${mo}/${dy}/${yr}, ${h12}:${pad(mn)}:${pad(sc)} ${ampm}`
}

function countdown(iso) {
  if (!iso) return { text: '-', urgency: 'none', expired: false }
  const diff = new Date(iso).getTime() - Date.now()
  if (isNaN(diff) || diff <= 0) return { text: '-', urgency: 'none', expired: true }
  const s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const mn = Math.floor((s % 3600) / 60)
  const sc = s % 60
  const pad = n => String(n).padStart(2, '0')
  const text = d > 0
    ? `${d}d ${pad(h)}h ${pad(mn)}m ${pad(sc)}s`
    : `${pad(h)}h ${pad(mn)}m ${pad(sc)}s`
  const urgency = diff < 3600000 ? 'critical' : diff < 7200000 ? 'warning' : 'none'
  return { text, urgency, expired: false }
}

function toDatetimeLocal(d) {
  if (!d || isNaN(d.getTime())) return ''
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function parseSmart(str) {
  if (!str || !str.trim()) return ''
  const s = str.trim(), now = new Date()
  // relative hours
  let m = s.match(/^(?:in\s+)?(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)$/i)
  if (m) return toDatetimeLocal(new Date(now.getTime() + parseFloat(m[1]) * 3600000))
  // relative minutes
  m = s.match(/^(?:in\s+)?(\d+)\s*(?:m|min|mins|minutes?)$/i)
  if (m) return toDatetimeLocal(new Date(now.getTime() + parseInt(m[1]) * 60000))
  // relative days
  m = s.match(/^(?:in\s+)?(\d+)\s*(?:d|days?)$/i)
  if (m) return toDatetimeLocal(new Date(now.getTime() + parseInt(m[1]) * 86400000))
  // M/D/YYYY h:mm(:ss)? AM/PM
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (m) {
    let h = parseInt(m[4]); const mn = parseInt(m[5]), mer = (m[7] || '').toLowerCase()
    if (mer === 'pm' && h < 12) h += 12; if (mer === 'am' && h === 12) h = 0
    return toDatetimeLocal(new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]), h, mn, 0))
  }
  // DD-MM-YYYY h:mm
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i)
  if (m) {
    let h = m[4] ? parseInt(m[4]) : 0; const mn = m[5] ? parseInt(m[5]) : 0, mer = (m[7] || '').toLowerCase()
    if (mer === 'pm' && h < 12) h += 12; if (mer === 'am' && h === 12) h = 0
    return toDatetimeLocal(new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]), h, mn, 0))
  }
  // time only hh:mm AM/PM
  m = s.match(/^(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (m) {
    let h = parseInt(m[1]); const mn = parseInt(m[2]), mer = (m[4] || '').toLowerCase()
    if (mer === 'pm' && h < 12) h += 12; if (mer === 'am' && h === 12) h = 0
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mn, 0)
    if (t <= now) t.setDate(t.getDate() + 1)
    return toDatetimeLocal(t)
  }
  // native fallback
  const p = new Date(s); if (!isNaN(p.getTime())) return toDatetimeLocal(p)
  return ''
}

// ════════════════════════════════════
//  RENDER
// ════════════════════════════════════
function renderTable() {
  const tbody = document.getElementById('tbody')
  const now = Date.now()

  // auto-reset expired rows
  let changed = false
  trackers.forEach(t => {
    if (t.gemini_status === 'limited' && t.gemini_reset) {
      if (new Date(t.gemini_reset).getTime() <= now) { t.gemini_status = 'available'; t.gemini_reset = null; changed = true }
    }
    if (t.claude_status === 'limited' && t.claude_reset) {
      if (new Date(t.claude_reset).getTime() <= now) { t.claude_status = 'available'; t.claude_reset = null; changed = true }
    }
  })
  if (changed) save()

  const badge = (status, date) => {
    if (status === 'available' || !date)
      return `<span class="status-badge"><span class="status-dot available"></span><span class="status-text available">Available</span></span>`
    return `<span class="status-badge"><span class="status-dot limited"></span><span class="status-text limited">${date}</span></span>`
  }
  const timer = (status, c) => {
    if (status === 'available') return `<span class="dash">-</span>`
    if (c.expired) return `<span class="dash">-</span>`
    return `<span class="countdown ${c.urgency}">${c.text}</span>`
  }

  tbody.innerHTML = trackers.map((t, i) => {
    const gd = fmtDate(t.gemini_reset)
    const cd = fmtDate(t.claude_reset)
    const gc = countdown(t.gemini_reset)
    const cc = countdown(t.claude_reset)
    return `<tr onclick="openEditModal(${i})">
      <td class="sl">${i + 1}</td>
      <td class="email">${t.email}</td>
      <td>${badge(t.gemini_status, gd)}</td>
      <td>${badge(t.claude_status, cd)}</td>
      <td>${timer(t.gemini_status, gc)}</td>
      <td>${timer(t.claude_status, cc)}</td>
    </tr>`
  }).join('')
}

// ════════════════════════════════════
//  ADD MODAL
// ════════════════════════════════════
function openAddModal() {
  document.getElementById('addEmail').value = ''
  document.getElementById('addGeminiStatus').value = 'available'
  document.getElementById('addGeminiReset').value = ''
  document.getElementById('addClaudeStatus').value = 'available'
  document.getElementById('addClaudeReset').value = ''
  document.getElementById('addOverlay').classList.add('open')
}
function closeAddModal() { document.getElementById('addOverlay').classList.remove('open') }
function saveAdd() {
  const email = document.getElementById('addEmail').value.trim()
  if (!email) { alert('Email is required'); return }
  trackers.push({
    id: 'row-' + Date.now(),
    email,
    gemini_status: document.getElementById('addGeminiStatus').value,
    gemini_reset:  document.getElementById('addGeminiReset').value || null,
    claude_status: document.getElementById('addClaudeStatus').value,
    claude_reset:  document.getElementById('addClaudeReset').value || null,
  })
  save(); closeAddModal(); renderTable()
}

// ════════════════════════════════════
//  EDIT MODAL
// ════════════════════════════════════
let editIdx = -1

function openEditModal(i) {
  editIdx = i
  const t = trackers[i]
  document.getElementById('editTitle').textContent = 'Edit: ' + t.email
  document.getElementById('editEmail').value = t.email
  document.getElementById('editGeminiStatus').value = t.gemini_status
  document.getElementById('editGeminiReset').value  = t.gemini_reset ? toDatetimeLocal(new Date(t.gemini_reset)) : ''
  document.getElementById('editGeminiPaste').value  = ''
  document.getElementById('editClaudeStatus').value = t.claude_status
  document.getElementById('editClaudeReset').value  = t.claude_reset ? toDatetimeLocal(new Date(t.claude_reset)) : ''
  document.getElementById('editClaudePaste').value  = ''
  document.getElementById('editOverlay').classList.add('open')
}
function closeEditModal() { document.getElementById('editOverlay').classList.remove('open') }

function smartPaste(service) {
  const raw = document.getElementById('edit' + service + 'Paste').value
  const parsed = parseSmart(raw)
  if (parsed) {
    document.getElementById('edit' + service + 'Reset').value = parsed
    document.getElementById('edit' + service + 'Status').value = 'limited'
  }
}

function saveEdit() {
  if (editIdx < 0) return
  const t = trackers[editIdx]
  t.email         = document.getElementById('editEmail').value.trim() || t.email
  t.gemini_status = document.getElementById('editGeminiStatus').value
  t.gemini_reset  = document.getElementById('editGeminiReset').value || null
  t.claude_status = document.getElementById('editClaudeStatus').value
  t.claude_reset  = document.getElementById('editClaudeReset').value || null
  save(); closeEditModal(); renderTable()
}

function deleteRow() {
  if (editIdx < 0) return
  if (!confirm('Delete this row?')) return
  trackers.splice(editIdx, 1)
  save(); closeEditModal(); renderTable()
}

// Close overlay on outside click
document.getElementById('addOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeAddModal() })
document.getElementById('editOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeEditModal() })

// ════════════════════════════════════
//  STARFIELD
// ════════════════════════════════════
;(function () {
  const canvas = document.getElementById('starfield')
  const ctx = canvas.getContext('2d')
  let stars = []

  function resize() {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    stars = Array.from({ length: 130 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.3,
      o:  Math.random() * 0.7 + 0.2,
      sp: Math.random() * 0.004 + 0.001,
      ph: Math.random() * Math.PI * 2,
    }))
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    stars.forEach(s => {
      const alpha = s.o * (0.6 + 0.4 * Math.sin(t * s.sp + s.ph))
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
      ctx.fill()
    })
    requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  requestAnimationFrame(draw)
})()

// ════════════════════════════════════
//  TICK
// ════════════════════════════════════
renderTable()
setInterval(renderTable, 1000)
