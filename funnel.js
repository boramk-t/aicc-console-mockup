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
  { id:'S1', name:'진입', count:48210, rate:100, sub:'ARS·챗봇·직통·채팅', leak:null,
    drill:{ title:'진입 채널 분포', rows:[['ARS','20,250건 (42%)'],['챗봇 직링크','14,940건 (31%)'],['상담사 직통','8,680건 (18%)'],['채팅상담 직링크','4,340건 (9%)']],
            extra:['ARS 유형 — 보이는 ARS 38% / 음성 ARS 62%'] } },
  { id:'S2', name:'봇 응대', count:41800, rate:86.7, sub:'콜봇·챗봇', leak:{ name:'미진입 이탈', count:6410, type:'drop' },
    drill:{ title:'봇 종류별 응대', rows:[['콜봇','24,100건 (58%)'],['챗봇','17,700건 (42%)']],
            extra:['미진입 이탈 6,410건 — 봇 진입 전 이탈'] } },
  { id:'S3', name:'봇 결과', count:25620, rate:61.3, sub:'봇 자동완결', leak:{ name:'봇 이탈', count:9770, type:'drop' },
    drill:{ title:'인텐트별 응답 실패 Top', rows:[['요금조회','실패율 31% ▲'],['요금제 변경','실패율 18%'],['명의변경','실패율 12%'],['단말기 재고','실패율 9%']],
            extra:['FALLBACK 상위 질문 3,200건 누적'] } },
  { id:'S4', name:'연결 대기', count:16180, rate:38.7, sub:'상담사 요청', leak:{ name:'대기중 이탈', count:2390, type:'abandon' },
    drill:{ title:'대기시간 구간별 이탈', rows:[['~30초','이탈 2%'],['30초~1분','이탈 7%'],['1~2분','이탈 13%'],['2분 초과','이탈 31% ▲']],
            extra:['이탈 급증 임계: 2분 12초','피크타임(10~11시) 이탈 집중'] } },
  { id:'S5', name:'상담 진행', count:13790, rate:33.0, sub:'홈·모바일 / CS·로밍·기술', leak:null,
    drill:{ title:'채널 × 상담유형', rows:[['홈 · CS일반','58%'],['홈 · 기술','28%'],['모바일 · 기술','45%'],['모바일 · 로밍','9%']],
            extra:['평균 처리시간 — 기술 7분 / CS 3분 / 로밍 9분'] } },
  { id:'S6', name:'종료', count:11900, rate:24.7, sub:'해결 종료', type:'resolved', leak:{ name:'호이관', count:1220, type:'drop' },
    drill:{ title:'종료 유형', rows:[['해결 종료','11,900건 (90.7%)'],['호이관','1,220건 (9.2%)']],
            extra:['호이관 경로 — CS일반→기술 18% ▲','해결 후 3일 내 재인입 6.4%'] } },
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
          <div class="jf-node ${s.type||'flow'}" onclick="openStepDrawer(${i})">
            <div class="jf-node-top">
              <span class="jf-name"><span class="jf-id">${s.id}</span> ${s.name}</span>
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
    fact:'상담사 연결 <strong>대기 이탈률이 9.2%에서 14.8%로 올랐습니다</strong> (전주 대비 +5.6%p).',
    cause:'평균 대기시간이 2분 12초를 넘겼고, 오전 피크타임(10~11시)에 인입이 몰린 영향으로 보입니다.',
    confidence:'추정 (신뢰도: 중간)',
    actions:['피크타임에 상담 인력을 더 배치해 보시길 권장합니다 [운영자]','예상 대기시간 안내나 콜백 기능 도입을 검토해 보세요 [기획]'],
    evidence:'ACD/CTI 대기 로그 · 시간대별 이탈 분포',
  },
  {
    severity:'high', sevLabel:'높음', topic:'봇 실패 · 봇 결과', isNew:false,
    fact:'<strong>요금조회 인텐트의 응답 실패율이 12%에서 31%로 급증했습니다</strong> (전주 대비).',
    cause:'새로 나온 요금제 관련 발화가 아직 학습되지 않아서 생긴 문제로 보입니다.',
    confidence:'추정 (신뢰도: 중간)',
    actions:['해당 인텐트의 학습데이터를 보강해 주세요 [서비스팀]','임시로 FALLBACK 답변을 등록해 두시면 좋겠습니다 [운영자]'],
    evidence:'DEFAULT_FALLBACK_LIST 3,200건 증가',
  },
  {
    severity:'mid', sevLabel:'주의', topic:'호이관 · 종료', isNew:false,
    fact:'<strong>CS 일반에서 기술 상담으로 넘기는 호이관이 18% 늘었습니다.</strong>',
    cause:'1차 상담사가 기술 문의에 바로 대응하기 어려운 스킬 갭이 있는 것으로 보입니다.',
    confidence:'추정 (신뢰도: 낮음)',
    actions:['초기 라우팅 코드 정의가 맞는지 점검해 보세요 [운영자]','기술 상담 스킬 교육을 검토해 보시길 권장합니다 [운영팀]'],
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
        <div class="ic-row"><span class="ic-key cause">왜 그럴까요</span><span class="ic-val">${it.cause}<span class="ic-confidence">· ${it.confidence}</span></span></div>
        <div class="ic-row"><span class="ic-key action">이렇게 해보세요</span><span class="ic-val">${it.actions.map(a=>'· '+a).join('<br/>')}</span></div>
      </div>
      <div class="ic-evidence">
        <div class="ic-evidence-head">📊 근거 데이터</div>
        <div class="ic-evidence-body">${it.evidence}</div>
        <button class="ic-evidence-btn" onclick="event.stopPropagation();openInsightDrawer(${i})">원천 데이터 상세 보기 ›</button>
      </div>
      <div class="ic-feedback">
        <span class="ic-fb-label">이 분석이 도움이 됐나요?</span>
        <button class="ic-fb-icon" title="도움됨" onclick="event.stopPropagation();fb('도움됨')">👍</button>
        <button class="ic-fb-icon" title="아니에요" onclick="event.stopPropagation();fb('아니에요')">👎</button>
      </div>
    </div>`).join('');
}
function fb(type){ showToast(`피드백(${type}) 감사합니다. 인사이트 정확도 개선에 활용할게요.`); }

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
function openStepDrawer(i) {
  const s = journeyStages[i];
  const d = s.drill;
  const leakHtml = s.leak ? `
    <h4>이탈 현황</h4>
    <div class="drawer-stat"><span>${s.leak.name}</span><strong style="color:${s.leak.type==='abandon'?'#f97316':'var(--red)'}">${s.leak.count.toLocaleString()}건</strong></div>` : '';
  const rows = d.rows.map(r => `<div class="drawer-stat"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join('');
  const extra = d.extra.map(e => `<li>${e}</li>`).join('');
  document.getElementById('drawerTitle').textContent = `${s.id}. ${s.name} 상세`;
  document.getElementById('drawerBody').innerHTML = `
    <h4>단계 요약</h4>
    <div class="drawer-stat"><span>유입 건수</span><strong>${s.count.toLocaleString()}건</strong></div>
    <div class="drawer-stat"><span>잔존율</span><strong>${s.rate}%</strong></div>
    ${leakHtml}
    <h4>${d.title}</h4>
    ${rows}
    <h4>눈여겨볼 점</h4>
    <ul class="drawer-list">${extra}</ul>
    <button class="drawer-cta" onclick="closeDrawerDirect()">관련 AI 인사이트 보기 ›</button>
    <p style="margin-top:12px;font-size:12px;color:var(--text-muted);">※ 세그먼트 수치는 선택한 기간·필터 기준입니다.</p>`;
  document.getElementById('drawer').classList.add('open');
}
function openInsightDrawer(i) {
  const it = insights[i];
  document.getElementById('drawerTitle').textContent = '인사이트 상세 · 근거';
  document.getElementById('drawerBody').innerHTML = `
    <div class="ic-head"><span class="ic-severity ${it.severity}">${it.sevLabel}</span><span class="ic-topic">${it.topic}</span></div>
    <h4>지금 무슨 일이 있나요</h4><p>${it.fact}</p>
    <h4>왜 그럴까요 (${it.confidence})</h4><p>${it.cause}</p>
    <h4>이렇게 해보세요</h4><p>${it.actions.map(a=>'· '+a).join('<br/>')}</p>
    <h4>근거 데이터</h4>
    <div class="drawer-stat"><span>${it.evidence}</span><strong>원천 조회</strong></div>
    <p style="margin-top:14px;font-size:12px;color:var(--text-muted);">※ 원인은 데이터 상관을 기반으로 추정한 내용이라 확정은 아닙니다. 실제 조치 전에 한 번 더 확인해 주세요.</p>`;
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
