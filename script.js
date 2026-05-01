(() => {
  const form = document.querySelector(".signup");
  const success = document.querySelector(".success");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (!form) return;

  form.addEventListener("submit", (event) => {
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.checkValidity()) return;

    event.preventDefault();

    form.setAttribute("hidden", "");
    if (success) {
      success.removeAttribute("hidden");
      success.focus?.();
    }

    const mailto = form.getAttribute("action");
    if (mailto && mailto.startsWith("mailto:")) {
      const url = `${mailto}?subject=${encodeURIComponent(
        "Yareliza signup",
      )}&body=${encodeURIComponent(
        `Hi,\n\nI'd like to be notified of Yareliza's launch.\n\nEmail: ${input.value}\n`,
      )}`;
      window.location.href = url;
    }
  });
})();
