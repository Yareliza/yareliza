(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Clean up any leftover audio session flag from the previous version
  try {
    sessionStorage.removeItem("bgm");
  } catch {}

  // About modal — bilingual bio (EN / ES)
  const trigger = document.getElementById("about-trigger");
  const modal = document.getElementById("about-modal");
  if (!trigger || !modal) return;

  const langButtons = modal.querySelectorAll(".about-lang");
  const texts = modal.querySelectorAll(".about-text");

  const setLang = (lang) => {
    langButtons.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    texts.forEach((t) => {
      if (t.dataset.lang === lang) t.removeAttribute("hidden");
      else t.setAttribute("hidden", "");
    });
    try {
      localStorage.setItem("bio-lang", lang);
    } catch {}
  };

  // Initial language: saved preference > browser language > English
  let initialLang = "en";
  try {
    const stored = localStorage.getItem("bio-lang");
    if (stored === "en" || stored === "es") initialLang = stored;
    else if ((navigator.language || "").toLowerCase().startsWith("es")) initialLang = "es";
  } catch {}
  setLang(initialLang);

  const open = () => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    trigger.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", open);

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest && t.closest("[data-close]")) {
      close();
      return;
    }
    if (t.classList && t.classList.contains("about-lang")) {
      setLang(t.dataset.lang);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
