/* ===== TOAST ===== */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ===== GNB 드롭다운 ===== */
function toggleSwitcher() {
  const btn = document.getElementById('switcherBtn');
  const profile = document.querySelector('.gnb-profile');
  btn.classList.toggle('open');
  profile.classList.remove('open');
}
function toggleProfile() {
  const profile = document.querySelector('.gnb-profile');
  const switcher = document.getElementById('switcherBtn');
  profile.classList.toggle('open');
  switcher.classList.remove('open');
}
document.addEventListener('click', (e) => {
  const switcher = document.getElementById('switcherBtn');
  const profile  = document.querySelector('.gnb-profile');
  if (switcher && !switcher.contains(e.target)) switcher.classList.remove('open');
  if (profile  && !profile.contains(e.target))  profile.classList.remove('open');
});

/* ===== 자주 찾는 메뉴 모달 ===== */
function openFavModal() {
  document.getElementById('favModal').classList.add('open');
  syncSelectState();
  updateFavCount();
}
function closeFavModal(e) {
  if (e.target === document.getElementById('favModal'))
    document.getElementById('favModal').classList.remove('open');
}
function closeFavModalDirect() {
  document.getElementById('favModal').classList.remove('open');
}
function saveFav() {
  document.getElementById('favModal').classList.remove('open');
  showToast('자주 찾는 메뉴가 저장되었습니다.');
}
function updateFavCount() {
  const checkboxes = document.querySelectorAll('.modal-checkbox-label input[type="checkbox"]');
  let count = [...checkboxes].filter(cb => cb.checked).length;
  if (count > 5) {
    const last = [...checkboxes].reverse().find(cb => cb.checked);
    if (last) { last.checked = false; count = 5; }
    showToast('자주 찾는 메뉴는 최대 5개까지 설정할 수 있습니다.');
  }
  document.getElementById('favCount').textContent = `${count} / 5 선택됨`;
  syncSelectState();
}
function syncSelectState() {
  document.querySelectorAll('.modal-service-item').forEach(item => {
    const cb  = item.querySelector('input[type="checkbox"]');
    const sel = item.querySelector('.modal-menu-select');
    if (cb && sel) sel.disabled = !cb.checked;
  });
}

/* ===== AI 추천 넛지 닫기 ===== */
function rejectNudge() {
  document.getElementById('nudgeCard').style.display = 'none';
}

/* ===== Skeleton Loading ===== */
function simulateSkeleton() {
  const targets = [...document.querySelectorAll('.bento-card, .pinned-card, .hero')];
  targets.forEach(el => el.classList.add('skeleton'));
  setTimeout(() => targets.forEach(el => el.classList.remove('skeleton')), 1200);
}

document.addEventListener('DOMContentLoaded', () => {
  simulateSkeleton();
  syncSelectState();
});
