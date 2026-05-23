(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Clean up any leftover audio session flag from a previous version
  try {
    sessionStorage.removeItem("bgm");
  } catch {}

  // ── Language ──────────────────────────────────────────────────────────────
  const STORAGE_KEY = "bio-lang";
  const supportedLang = (l) => (l === "en" || l === "es" ? l : null);
  const getLang = () => {
    try {
      const stored = supportedLang(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch {}
    if ((navigator.language || "").toLowerCase().startsWith("es")) return "es";
    return "en";
  };
  const setStoredLang = (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  };

  // Strings for the subscribe modal + the trigger label
  const STRINGS = {
    en: {
      triggerLabel: "Get notified",
      title: "Be the first to know",
      sub: "when the album drops",
      placeholder: "your@email.com",
      submit: "Notify me",
      submitting: "Sending…",
      successTitle: "You're on the list",
      successSub: "We'll email you when the album drops.",
      errorInvalid: "Please enter a valid email address.",
      errorNetwork: "Something went wrong. Please try again.",
      label: "Email address",
    },
    es: {
      triggerLabel: "Avísame",
      title: "Sé la primera en saber",
      sub: "cuando salga el álbum",
      placeholder: "tu@correo.com",
      submit: "Avísame",
      submitting: "Enviando…",
      successTitle: "Estás en la lista",
      successSub: "Te avisamos cuando salga el álbum.",
      errorInvalid: "Ingresa un email válido.",
      errorNetwork: "Algo salió mal. Inténtalo de nuevo.",
      label: "Correo electrónico",
    },
  };

  // ── About modal (bilingual bio) ───────────────────────────────────────────
  const aboutTrigger = document.getElementById("about-trigger");
  const aboutModal = document.getElementById("about-modal");
  const aboutLangButtons = aboutModal ? aboutModal.querySelectorAll(".about-lang") : [];
  const aboutTexts = aboutModal ? aboutModal.querySelectorAll(".about-text") : [];

  const applyAboutLang = (lang) => {
    aboutLangButtons.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    aboutTexts.forEach((t) => {
      if (t.dataset.lang === lang) t.removeAttribute("hidden");
      else t.setAttribute("hidden", "");
    });
  };

  if (aboutTrigger && aboutModal) {
    applyAboutLang(getLang());

    const open = () => {
      aboutModal.hidden = false;
      document.body.style.overflow = "hidden";
      aboutTrigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      aboutModal.hidden = true;
      document.body.style.overflow = "";
      aboutTrigger.setAttribute("aria-expanded", "false");
    };

    aboutTrigger.addEventListener("click", open);
    aboutModal.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest && t.closest("[data-close]")) {
        close();
        return;
      }
      if (t.classList && t.classList.contains("about-lang")) {
        const lang = t.dataset.lang;
        setStoredLang(lang);
        applyAboutLang(lang);
        applySubscribeLang(lang);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !aboutModal.hidden) close();
    });
  }

  // ── Subscribe modal (email capture → Cloudflare Worker) ──────────────────
  const SUBSCRIBE_ENDPOINT = "https://yareliza-api.321elevation.workers.dev/subscribe";

  const subscribeTrigger = document.getElementById("subscribe-trigger");
  const subscribeModal = document.getElementById("subscribe-modal");
  const subscribeForm = document.getElementById("subscribe-form");
  const subscribeEmail = document.getElementById("subscribe-email");
  const subscribeSubmit = document.getElementById("subscribe-submit");
  const subscribeError = document.getElementById("subscribe-error");
  const subscribeFormView = document.getElementById("subscribe-form-view");
  const subscribeSuccessView = document.getElementById("subscribe-success-view");

  const applySubscribeLang = (lang) => {
    const s = STRINGS[lang] || STRINGS.en;
    if (subscribeTrigger) subscribeTrigger.textContent = s.triggerLabel;
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText("subscribe-title", s.title);
    setText("subscribe-sub", s.sub);
    setText("subscribe-label", s.label);
    setText("subscribe-success-title", s.successTitle);
    setText("subscribe-success-sub", s.successSub);
    if (subscribeEmail) subscribeEmail.placeholder = s.placeholder;
    if (subscribeSubmit && !subscribeSubmit.dataset.sending) subscribeSubmit.textContent = s.submit;
  };

  // Apply initial language to subscribe UI on load
  applySubscribeLang(getLang());

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (subscribeTrigger && subscribeModal && subscribeForm) {
    const open = () => {
      subscribeModal.hidden = false;
      document.body.style.overflow = "hidden";
      subscribeTrigger.setAttribute("aria-expanded", "true");
      // Reset to form view (in case it was closed on success)
      subscribeFormView.hidden = false;
      subscribeSuccessView.hidden = true;
      subscribeError.hidden = true;
      // Focus the email input shortly after open
      setTimeout(() => subscribeEmail?.focus(), 80);
    };
    const close = () => {
      subscribeModal.hidden = true;
      document.body.style.overflow = "";
      subscribeTrigger.setAttribute("aria-expanded", "false");
    };

    subscribeTrigger.addEventListener("click", open);
    subscribeModal.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest && t.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !subscribeModal.hidden) close();
    });

    subscribeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const lang = getLang();
      const s = STRINGS[lang] || STRINGS.en;
      const email = (subscribeEmail.value || "").trim().toLowerCase();

      if (!EMAIL_RE.test(email) || email.length > 254) {
        subscribeError.textContent = s.errorInvalid;
        subscribeError.hidden = false;
        subscribeEmail.focus();
        return;
      }

      subscribeError.hidden = true;
      subscribeSubmit.disabled = true;
      subscribeSubmit.dataset.sending = "1";
      subscribeSubmit.textContent = s.submitting;

      try {
        const r = await fetch(SUBSCRIBE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang, source: "website" }),
        });
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.ok) {
          subscribeFormView.hidden = true;
          subscribeSuccessView.hidden = false;
          if (typeof gtag === "function") {
            gtag("event", "subscribe", { event_category: "engagement", lang });
          }
        } else if (data.error === "invalid_email") {
          subscribeError.textContent = s.errorInvalid;
          subscribeError.hidden = false;
        } else {
          throw new Error(data.error || "request_failed");
        }
      } catch {
        subscribeError.textContent = s.errorNetwork;
        subscribeError.hidden = false;
      } finally {
        subscribeSubmit.disabled = false;
        delete subscribeSubmit.dataset.sending;
        subscribeSubmit.textContent = s.submit;
      }
    });
  }
})();
