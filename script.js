(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const audio = document.getElementById("bgm");
  const toggle = document.getElementById("audio-toggle");
  if (!audio || !toggle) return;

  audio.volume = 0.55;

  const setState = (playing) => {
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    try {
      sessionStorage.setItem("bgm", playing ? "1" : "0");
    } catch {}
  };

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setState(true);
      } catch {
        setState(false);
      }
    } else {
      audio.pause();
      setState(false);
    }
  });

  audio.addEventListener("play", () => setState(true));
  audio.addEventListener("pause", () => setState(false));

  // Resume across in-tab navigations within the session
  try {
    if (sessionStorage.getItem("bgm") === "1") {
      audio.play().catch(() => {});
    }
  } catch {}
})();
