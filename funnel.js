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

/* ===== 퍼널 단계 데이터 ===== */
const funnelSteps = [
  { lv:1, name:'진입', desc:'ARS·챗봇·직통·채팅링크', count:48210, rate:100, type:'' },
  { lv:2, name:'봇 응대', desc:'콜봇·챗봇 자동 응대', count:41800, rate:86.7, type:'' },
  { lv:3, name:'봇 해결(완결)', desc:'봇 단계에서 해결 종료', count:25620, rate:61.3, type:'' },
  { lv:4, name:'상담사 연결 요청', desc:'봇 → 상담사 전환', count:16180, rate:38.7, type:'warn' },
  { lv:5, name:'상담사 연결 대기', desc:'대기 중 이탈 14.8%', count:13790, rate:85.2, type:'drop' },
  { lv:6, name:'상담사 연결', desc:'홈/모바일 채널 분기', count:13790, rate:100, type:'' },
  { lv:7, name:'상담 진행', desc:'CS일반·로밍·기술', count:13120, rate:95.1, type:'' },
  { lv:8, name:'상담 종료', desc:'해결 / 호이관 9.2%', count:11900, rate:90.7, type:'warn' },
];

function renderFunnel() {
  const wrap = document.getElementById('funnelFlow');
  wrap.innerHTML = funnelSteps.map((s, i) => {
    const rateClass = s.type === 'drop' ? 'drop' : 'pass';
    const bar = `<div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${s.rate}%"></div></div>`;
    const step = `
      <div class="funnel-step ${s.type}" onclick="openStepDrawer(${i})">
        <div class="fs-left">
          <span class="fs-lv">${s.lv}</span>
          <div>
            <div class="fs-name">${s.name}</div>
            <div class="fs-desc">${s.desc}</div>
          </div>
        </div>
        <div class="fs-right">
          <span class="fs-count">${s.count.toLocaleString()}건</span>
          <span class="fs-rate ${rateClass}">${s.rate}%</span>
        </div>
      </div>`;
    return i === 0 ? step : bar + step;
  }).join('');
}

/* ===== AI 인사이트 (현상 → 원인후보 → Action) ===== */
const insights = [
  {
    severity:'high', sevLabel:'높음', topic:'대기 이탈 · Lv5',
    fact:'상담사 연결 <strong>대기 이탈률 9.2% → 14.8%</strong> (전주比 +5.6%p)',
    cause:'평균 대기시간 2분 12초 초과 + 피크타임(10~11시) 인입 집중 추정',
    confidence:'추정 (신뢰도: 중간)',
    actions:['피크타임 상담 인력 재배치 검토 [운영자]','예상 대기시간 안내·콜백 도입 검토 [기획]'],
    evidence:'ACD/CTI 대기 로그 · 시간대별 이탈 분포',
  },
  {
    severity:'high', sevLabel:'높음', topic:'봇 실패 · Lv3',
    fact:'<strong>요금조회 인텐트 응답 실패율 12% → 31%</strong> (전주比)',
    cause:'신규 요금제 발화 미학습으로 추정',
    confidence:'추정 (신뢰도: 중간)',
    actions:['해당 인텐트 학습데이터 보강 [서비스팀]','FALLBACK 임시 답변 등록 [운영자]'],
    evidence:'DEFAULT_FALLBACK_LIST 3,200건 ↑',
  },
  {
    severity:'mid', sevLabel:'주의', topic:'호이관 · Lv8',
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
    <div class="insight-card" onclick="openInsightDrawer(${i})">
      <div class="ic-head">
        <span class="ic-severity ${it.severity}">${it.sevLabel}</span>
        <span class="ic-topic">${it.topic}</span>
      </div>
      <div class="ic-row"><span class="ic-key fact">현상</span><span class="ic-val">${it.fact}</span></div>
      <div class="ic-row"><span class="ic-key cause">원인</span><span class="ic-val">${it.cause}<span class="ic-confidence">· ${it.confidence}</span></span></div>
      <div class="ic-row"><span class="ic-key action">Action</span><span class="ic-val">${it.actions.map(a=>'· '+a).join('<br/>')}</span></div>
      <div class="ic-evidence">📊 근거: ${it.evidence} <span class="ic-evidence-link" onclick="event.stopPropagation();openInsightDrawer(${i})">상세보기</span></div>
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

/* ===== 드로어 ===== */
function openStepDrawer(i) {
  const s = funnelSteps[i];
  document.getElementById('drawerTitle').textContent = `Lv${s.lv}. ${s.name} 상세`;
  document.getElementById('drawerBody').innerHTML = `
    <p>선택한 단계의 세그먼트별 분해입니다. (드릴다운 예시)</p>
    <h4>단계 요약</h4>
    <div class="drawer-stat"><span>유입 건수</span><strong>${s.count.toLocaleString()}건</strong></div>
    <div class="drawer-stat"><span>전환/잔존율</span><strong>${s.rate}%</strong></div>
    <h4>진입 채널별</h4>
    <div class="drawer-stat"><span>ARS</span><strong>42%</strong></div>
    <div class="drawer-stat"><span>챗봇 직링크</span><strong>31%</strong></div>
    <div class="drawer-stat"><span>상담사 직통</span><strong>18%</strong></div>
    <div class="drawer-stat"><span>채팅상담 직링크</span><strong>9%</strong></div>
    <h4>상담 유형별</h4>
    <div class="drawer-stat"><span>CS 일반</span><strong>58%</strong></div>
    <div class="drawer-stat"><span>로밍</span><strong>14%</strong></div>
    <div class="drawer-stat"><span>기술</span><strong>28%</strong></div>`;
  document.getElementById('drawer').classList.add('open');
}
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

/* ===== 고객 여정 그래프 (Journey Flow) ===== */
const journeyCols = [
  { title:'진입', nodes:[
    { name:'ARS', count:'20,250건', type:'flow', w:100 },
    { name:'챗봇 직링크', count:'14,940건', type:'flow', w:74 },
    { name:'상담사 직통', count:'8,680건', type:'flow', w:43 },
    { name:'채팅상담 직링크', count:'4,340건', type:'flow', w:22 },
  ]},
  { title:'봇 응대', nodes:[
    { name:'콜봇', count:'24,100건', type:'flow', w:100 },
    { name:'챗봇', count:'17,700건', type:'flow', w:73 },
  ]},
  { title:'봇 결과', nodes:[
    { name:'봇 해결', count:'25,620건', type:'resolved', w:100 },
    { name:'이탈', count:'6,410건', type:'drop', w:25 },
    { name:'상담사 요청', count:'16,180건', type:'flow', w:63 },
  ]},
  { title:'연결 대기', nodes:[
    { name:'연결 성공', count:'13,790건', type:'flow', w:85 },
    { name:'대기중 이탈', count:'2,390건', type:'abandon', w:15 },
  ]},
  { title:'상담', nodes:[
    { name:'홈 채널', count:'7,580건', type:'flow', w:55 },
    { name:'모바일 채널', count:'6,210건', type:'flow', w:45 },
  ]},
  { title:'종료', nodes:[
    { name:'해결 종료', count:'11,900건', type:'resolved', w:100 },
    { name:'호이관', count:'1,220건', type:'drop', w:10 },
  ]},
];
function renderJourney() {
  document.getElementById('journeyFlow').innerHTML = journeyCols.map(col => `
    <div class="journey-col">
      <div class="journey-col-title">${col.title}</div>
      ${col.nodes.map(n => `
        <div class="journey-node ${n.type}" onclick="showToast('${n.name} 상세로 이동합니다.')">
          <div class="jn-name">${n.name}</div>
          <div class="jn-count">${n.count}</div>
          <div class="jn-bar" style="width:${n.w}%"></div>
        </div>`).join('')}
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
  const el = document.getElementById('typeMatrix');
  el.innerHTML = typeMatrix.map(col => `
    <div class="matrix-col">
      <div class="matrix-stack" style="height:90%">
        <div class="matrix-seg cs" style="height:${col.cs}%">${col.cs}</div>
        <div class="matrix-seg roaming" style="height:${col.roaming}%">${col.roaming}</div>
        <div class="matrix-seg tech" style="height:${col.tech}%">${col.tech}</div>
      </div>
      <span class="matrix-label">${col.label}</span>
    </div>`).join('');
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderJourney();
  renderFunnel();
  renderInsights();
  renderTrend();
  renderChannelMix();
  renderMatrix();
});
