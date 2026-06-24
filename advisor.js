/* ===== 상담 어드바이저 · 인터랙션 ===== */

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* 사이드바 접기/펴기 */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('collapsed');
}

/* 실시간 상담 검색 토글 */
function toggleLiveSearch() {
  const el = document.getElementById('liveSearch');
  if (el.style.display === 'none') {
    el.style.display = 'flex';
    el.querySelector('input').focus();
  } else {
    el.style.display = 'none';
  }
}

/* 상담 세션 탭 전환 */
function selectTab(el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* SOS 토글 (긴급 지원 요청) */
function toggleSos() {
  const btn = document.getElementById('sosBtn');
  const on = btn.classList.toggle('active');
  toast(on ? 'SOS — 슈퍼바이저에게 긴급 지원을 요청했습니다.' : 'SOS 요청을 취소했습니다.');
}

/* 상담 어시스트 ON/OFF */
function toggleAssist() {
  const sw = document.getElementById('assistSwitch');
  const on = sw.classList.toggle('on');
  document.getElementById('assistBody').style.display = on ? 'flex' : 'none';
  document.getElementById('assistEmpty').classList.toggle('show', !on);
  toast(on ? '상담 어시스트를 켰습니다.' : '상담 어시스트를 껐습니다.');
}

/* 말투 토글 그룹 */
function pickTone(el) {
  el.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

/* 어시스트 모드 드롭다운 */
function toggleModelDropdown() {
  const dd = document.getElementById('modelDropdown');
  dd.classList.toggle('show');
}
function selectModel(el, name) {
  document.querySelectorAll('.model-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('modelLabel').textContent = name;
  document.getElementById('modelDropdown').classList.remove('show');
  toast('모드 변경: ' + name);
}

/* 드롭다운 외부 클릭 닫기 */
document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.model-dropdown-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('modelDropdown').classList.remove('show');
  }
});

/* 어시스트 전송 */
function sendAssist() {
  const ta = document.querySelector('.composer textarea');
  const v = ta.value.trim();
  if (!v) { toast('질문을 입력해 주세요.'); return; }
  addUserBubble(v);
  toast('어시스트에게 질문을 전송했습니다.');
  ta.value = '';
  ta.style.height = 'auto';
}

/* 추천 질문 클릭 */
function askQuestion(q) {
  addUserBubble(q);
  toast('질문을 전송했습니다: ' + q);
}

/* 사용자 버블 동적 추가 */
function addUserBubble(text) {
  const body = document.getElementById('assistBody');
  const row = document.createElement('div');
  row.className = 'chat-row user';
  row.innerHTML = '<div class="chat-bubble user-bubble">' + text + '</div>';
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}

/* 데모 상태 전환: 기본 / 로딩 / 오류 / 리더 — moved to bottom (combined with leader view) */

/* textarea 자동 높이 */
document.addEventListener('input', (e) => {
  if (e.target.matches('.composer textarea')) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  }
});

/* Enter 전송 (Shift+Enter 줄바꿈) */
document.addEventListener('keydown', (e) => {
  if (e.target.matches('.composer textarea') && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAssist();
  }
});

/* ===== DIALOG MODALS ===== */

function openDialog(id, btn) {
  document.getElementById(id).classList.add('show');
}

function closeDialog(id) {
  document.getElementById(id).classList.remove('show');
}

/* Close dialog on overlay click */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('dialog-overlay')) {
    e.target.classList.remove('show');
  }
});

/* Close dialog on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.dialog-overlay.show').forEach(d => d.classList.remove('show'));
  }
});

/* Star rating */
function setRating(value) {
  const stars = document.querySelectorAll('#starRating .star');
  stars.forEach((star, i) => {
    if (i < value) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

/* Slot toggle buttons */
function pickSlotToggle(el) {
  el.parentElement.querySelectorAll('.slot-toggle').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ===== LEADER MONITOR VIEW ===== */

function setState(state, btn) {
  document.querySelectorAll('.demo-bar button').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');

  const body = document.getElementById('assistBody');
  const empty = document.getElementById('assistEmpty');
  const composer = document.querySelector('.composer-wrap');
  const loading = document.getElementById('loadingPane');
  const error = document.getElementById('errorPane');
  const swOn = document.getElementById('assistSwitch').classList.contains('on');
  const leaderView = document.getElementById('leaderView');
  const workspace = document.querySelector('.workspace');
  const tabnav = document.querySelector('.tabnav');

  // reset
  loading.classList.remove('show');
  error.classList.remove('show');
  composer.classList.remove('hidden');
  leaderView.style.display = 'none';
  workspace.style.display = '';
  tabnav.style.display = '';

  if (state === 'loading') {
    body.style.display = 'none';
    empty.classList.remove('show');
    composer.classList.add('hidden');
    loading.classList.add('show');
  } else if (state === 'error') {
    body.style.display = 'none';
    empty.classList.remove('show');
    composer.classList.add('hidden');
    error.classList.add('show');
  } else if (state === 'leader') {
    workspace.style.display = 'none';
    tabnav.style.display = 'none';
    leaderView.style.display = 'flex';
  } else {
    // default
    body.style.display = swOn ? 'flex' : 'none';
    empty.classList.toggle('show', !swOn);
  }
}

/* Select agent in leader table */
function selectAgent(row, name) {
  // Highlight row
  document.querySelectorAll('.leader-table tbody tr').forEach(tr => tr.classList.remove('row-active'));
  row.classList.add('row-active');
  // Highlight agent link
  document.querySelectorAll('.agent-link').forEach(a => a.classList.remove('active'));
  row.querySelector('.agent-link').classList.add('active');
  // Update chat header name
  document.getElementById('leaderChatName').textContent = name;
  toast(name + ' 상담사의 대화를 모니터링합니다.');
}

/* Scroll leader chat to bottom */
function scrollLeaderChat() {
  const chat = document.getElementById('leaderChatMessages');
  chat.scrollTop = chat.scrollHeight;
}
