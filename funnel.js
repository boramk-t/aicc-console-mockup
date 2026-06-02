/* ===== TOAST ===== */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===== GNB 스위처 ===== */
function toggleSwitcher() {
  document.getElementById('switcherBtn').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const s = document.getElementById('switcherBtn');
  if (s && !s.contains(e.target)) s.classList.remove('open');
});

/* ===== 고객 여정 그래프 (Journey Flow) — 메인 라인 + 이탈 가지 ===== */
const journeyStages = [
  { name:'진입', count:48210, rate:100, sub:'ARS·챗봇·직통·채팅', leak:null },
  { name:'봇 응대', count:41800, rate:86.7, sub:'콜봇·챗봇', leak:{ name:'미진입 이탈', count:6410, type:'drop' } },
  { name:'봇 결과', count:25620, rate:61.3, sub:'봇 자동완결', leak:{ name:'봇 이탈', count:9770, type:'drop' } },
  { name:'연결 대기', count:16180, rate:38.7, sub:'상담사 요청', leak:{ name:'대기중 이탈', count:2390, type:'abandon' } },
  { name:'상담 진행', count:13790, rate:33.0, sub:'홈·모바일 / CS·로밍·기술', leak:null },
  { name:'종료', count:11900, rate:24.7, sub:'해결 종료', type:'resolved', leak:{ name:'호이관', count:1220, type:'drop' } },
];
function renderJourney() {
  const flow = journeyStages.map((s, i) => {
    const isLast = i === journeyStages.length - 1;
    const arrow = isLast ? '' : `<div class="jf-arrow">→</div>`;
    const leak = s.leak ? `
      <div class="jf-leak-wrap">
        <div class="jf-leak-line"></div>
        <div class="jf-leak ${s.leak.type}" onclick="event.stopPropagation();showToast('${s.leak.name} 상세로 이동합니다.')">
          <span class="jf-leak-icon">${s.leak.type==='abandon'?'⏱':'↓'}</span>
          <div>
            <div class="jf-leak-name">${s.leak.name}</div>
            <div class="jf-leak-count">${s.leak.count.toLocaleString()}건</div>
          </div>
        </div>
      </div>` : `<div class="jf-leak-wrap"></div>`;
    return `
      <div class="jf-stage">
        <div class="jf-main">
          <div class="jf-node ${s.type||'flow'}" onclick="showToast('${s.name} 상세로 이동합니다.')">
            <div class="jf-node-top">
              <span class="jf-name">${s.name}</span>
              <span class="jf-rate">${s.rate}%</span>
            </div>
            <div class="jf-count">${s.count.toLocaleString()}건</div>
            <div class="jf-sub">${s.sub}</div>
          </div>
          ${arrow}
        </div>
        ${leak}
      </div>`;
  }).join('');
  document.getElementById('journeyFlow').innerHTML = flow;
}

/* ===== AI 인사이트 (현상 → 원인후보 → Action) ===== */
const insights = [
  {
    severity:'high', sevLabel:'높음', topic:'대기 이탈 · 연결 대기', isNew:true,
    fact:'상담사 연결 <strong>대기 이탈률 9.2% → 14.8%</strong> (전주比 +5.6%p)',
    cause:'평균 대기시간 2분 12초 초과 + 피크타임(10~11시) 인입 집중 추정',
    confidence:'추정 (신뢰도: 중간)',
    actions:['피크타임 상담 인력 재배치 검토 [운영자]','예상 대기시간 안내·콜백 도입 검토 [기획]'],
    evidence:'ACD/CTI 대기 로그 · 시간대별 이탈 분포',
  },
  {
    severity:'high', sevLabel:'높음', topic:'봇 실패 · 봇 결과', isNew:false,
    fact:'<strong>요금조회 인텐트 응답 실패율 12% → 31%</strong> (전주比)',
    cause:'신규 요금제 발화 미학습으로 추정',
    confidence:'추정 (신뢰도: 중간)',
    actions:['해당 인텐트 학습데이터 보강 [서비스팀]','FALLBACK 임시 답변 등록 [운영자]'],
    evidence:'DEFAULT_FALLBACK_LIST 3,200건 ↑',
  },
  {
    severity:'mid', sevLabel:'주의', topic:'호이관 · 종료', isNew:false,
    fact:'<strong>CS일반 → 기술 호이관 18% 증가</strong>',
    cause:'1차 상담사 기술문의 대응 스킬 갭 추정',
    confidence:'추정 (신뢰도: 낮음)',
    actions:['초기 라우팅 코드 정의 점검 [운영자]','기술상담 스킬 교육 검토 [운영팀]'],
    evidence:'CTI 호 전환 로그 · 코드유형별 호이관',
  },
];
function renderInsights() {
  const list = document.getElementById('insightList');
  list.innerHTML = insights.map((it, i) => `
    <div class="insight-card sev-${it.severity}" onclick="openInsightDrawer(${i})">
      <div class="ic-head">
        <span class="ic-severity ${it.severity}">${it.sevLabel}</span>
        <span class="ic-topic">${it.topic}</span>
        ${it.isNew ? '<span class="ic-new">NEW</span>' : ''}
      </div>
      <div class="ic-fact">${it.fact}</div>
      <div class="ic-body">
        <div class="ic-row"><span class="ic-key cause">원인 추정</span><span class="ic-val">${it.cause}<span class="ic-confidence">· ${it.confidence}</span></span></div>
        <div class="ic-row"><span class="ic-key action">권장 Action</span><span class="ic-val">${it.actions.map(a=>'· '+a).join('<br/>')}</span></div>
      </div>
      <div class="ic-evidence">📊 ${it.evidence} <span class="ic-evidence-link" onclick="event.stopPropagation();openInsightDrawer(${i})">근거 상세 ›</span></div>
      <div class="ic-feedback">
        <button class="ic-fb-btn" onclick="event.stopPropagation();fb('도움됨')">👍 도움됨</button>
        <button class="ic-fb-btn" onclick="event.stopPropagation();fb('틀림')">👎 틀림</button>
        <button class="ic-fb-btn" onclick="event.stopPropagation();fb('확인')">✓ 확인됨</button>
      </div>
    </div>`).join('');
}
function fb(type){ showToast(`피드백(${type})이 반영되었습니다. 인사이트 정확도 개선에 활용됩니다.`); }

/* ===== 추세 그래프 (대기 이탈률 7일) ===== */
const trendData = [
  { d:'월', v:9.1 }, { d:'화', v:9.8 }, { d:'수', v:11.2 }, { d:'목', v:10.5 },
  { d:'금', v:12.9 }, { d:'토', v:14.8, peak:true }, { d:'일', v:13.1 },
];
function renderTrend() {
  const max = Math.max(...trendData.map(d=>d.v));
  document.getElementById('trendChart').innerHTML = trendData.map(d => `
    <div class="trend-col">
      <div class="trend-bar-wrap">
        <div class="trend-bar ${d.peak?'peak':''}" style="height:${(d.v/max*100)}%">
          <span class="trend-bar-val">${d.v}%</span>
        </div>
      </div>
      <span class="trend-label">${d.d}</span>
    </div>`).join('');
}

/* ===== 진입 채널 믹스 ===== */
const channelMix = [
  { label:'ARS', pct:42, c:'c1' },
  { label:'챗봇 직링크', pct:31, c:'c2' },
  { label:'상담사 직통', pct:18, c:'c3' },
  { label:'채팅상담 직링크', pct:9, c:'c4' },
];
function renderChannelMix() {
  document.getElementById('channelMix').innerHTML = channelMix.map(m => `
    <div class="mix-row">
      <span class="mix-label">${m.label}</span>
      <div class="mix-bar-track"><div class="mix-bar-fill ${m.c}" style="width:${m.pct}%">${m.pct}%</div></div>
    </div>`).join('');
}

/* ===== 채널 × 상담유형 매트릭스 ===== */
const typeMatrix = [
  { label:'홈', cs:58, roaming:14, tech:28 },
  { label:'모바일', cs:46, roaming:9, tech:45 },
];
function renderMatrix() {
  document.getElementById('typeMatrix').innerHTML = typeMatrix.map(col => `
    <div class="matrix-col">
      <div class="matrix-stack" style="height:90%">
        <div class="matrix-seg cs" style="height:${col.cs}%">${col.cs}</div>
        <div class="matrix-seg roaming" style="height:${col.roaming}%">${col.roaming}</div>
        <div class="matrix-seg tech" style="height:${col.tech}%">${col.tech}</div>
      </div>
      <span class="matrix-label">${col.label}</span>
    </div>`).join('');
}

/* ===== 드로어 ===== */
function openInsightDrawer(i) {
  const it = insights[i];
  document.getElementById('drawerTitle').textContent = '인사이트 상세 · 근거';
  document.getElementById('drawerBody').innerHTML = `
    <div class="ic-head"><span class="ic-severity ${it.severity}">${it.sevLabel}</span><span class="ic-topic">${it.topic}</span></div>
    <h4>현상 (집계 사실)</h4><p>${it.fact}</p>
    <h4>원인 후보 (${it.confidence})</h4><p>${it.cause}</p>
    <h4>권장 Action</h4><p>${it.actions.map(a=>'· '+a).join('<br/>')}</p>
    <h4>근거 데이터</h4>
    <div class="drawer-stat"><span>${it.evidence}</span><strong>원천 조회</strong></div>
    <p style="margin-top:14px;font-size:12px;color:var(--text-muted);">※ 원인은 데이터 상관 기반 추정이며 확정이 아닙니다. 실제 조치 전 검증이 필요합니다.</p>`;
  document.getElementById('drawer').classList.add('open');
}
function closeDrawer(e){ if(e.target===document.getElementById('drawer')) closeDrawerDirect(); }
function closeDrawerDirect(){ document.getElementById('drawer').classList.remove('open'); }

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderJourney();
  renderInsights();
  renderTrend();
  renderChannelMix();
  renderMatrix();
});
