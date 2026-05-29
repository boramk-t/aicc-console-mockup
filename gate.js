/* ===== 비밀번호 게이트 (JS 해시 방식) =====
   - SHA-256 해시 비교로 접근 제어
   - 정적 사이트용 간이 보호 (소스 노출 시 우회 가능)
*/
(function () {
  const PASS_HASH = "2ad92a7ebf814925a4331f4702d9b0536418070c1e498152e46bc016526ef63d"; // AICC26
  const SESSION_KEY = "aicc_gate_ok";

  // 이미 인증된 세션이면 통과
  if (sessionStorage.getItem(SESSION_KEY) === "1") return;

  // 본문 숨김
  const style = document.createElement("style");
  style.id = "gate-hide-style";
  style.textContent = "body > *:not(#gate-overlay){filter:blur(8px);pointer-events:none;user-select:none;}";
  document.documentElement.appendChild(style);

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function buildGate() {
    const overlay = document.createElement("div");
    overlay.id = "gate-overlay";
    overlay.innerHTML = `
      <div class="gate-card">
        <div class="gate-logo"><span class="gate-uplus">U+</span><span class="gate-title">AICC Console</span></div>
        <p class="gate-desc">이 페이지는 비밀번호로 보호되어 있습니다.</p>
        <form id="gate-form">
          <input id="gate-input" type="password" placeholder="비밀번호를 입력하세요" autocomplete="off" autofocus />
          <button type="submit">입장</button>
        </form>
        <p class="gate-error" id="gate-error"></p>
      </div>`;
    document.body.appendChild(overlay);

    const form = overlay.querySelector("#gate-form");
    const input = overlay.querySelector("#gate-input");
    const err = overlay.querySelector("#gate-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hash = await sha256(input.value);
      if (hash === PASS_HASH) {
        sessionStorage.setItem(SESSION_KEY, "1");
        overlay.remove();
        const s = document.getElementById("gate-hide-style");
        if (s) s.remove();
      } else {
        err.textContent = "비밀번호가 올바르지 않습니다.";
        input.value = "";
        input.focus();
      }
    });
  }

  if (document.body) buildGate();
  else document.addEventListener("DOMContentLoaded", buildGate);
})();
