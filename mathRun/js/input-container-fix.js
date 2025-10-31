/*!
 * Windows11 + Chromium 포커스 위임(focus delegation) 버그 수정 스크립트 (개선판)
 * 부모 div에 tabindex가 있을 때 input이 스페이스/엔터 입력 시 blur되는 현상 방지
 * 작성: bh
 */
(function () {
  function lockFocus(element) {
    element.addEventListener("blur", () => {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        const parentTab = element.closest('[tabindex]');
        if (active === parentTab) {
          element.focus();
        }
      });
    });

    element.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.stopPropagation();
      }
    });

    element.addEventListener("compositionend", () => {
      setTimeout(() => element.focus(), 30);
    });
  }

  function initAllInputs() {
    document.querySelectorAll("input, textarea").forEach(lockFocus);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllInputs);
  } else {
    initAllInputs();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
          lockFocus(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll("input, textarea").forEach(lockFocus);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
