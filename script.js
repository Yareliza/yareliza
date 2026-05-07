(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const audio = document.getElementById("bgm");
  const toggle = document.getElementById("audio-toggle");
  const playerWrap = document.querySelector(".player");
  const fill = document.getElementById("player-fill");
  const cur = document.getElementById("player-current");
  const dur = document.getElementById("player-duration");
  const slider = document.querySelector(".player-progress");
  const playsEl = document.getElementById("player-plays");
  if (!audio || !toggle) return;

  audio.volume = 0.55;

  const formatTime = (s) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const setPlaying = (playing) => {
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
    toggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    if (playerWrap) playerWrap.dataset.playing = playing ? "true" : "false";
    try {
      sessionStorage.setItem("bgm", playing ? "1" : "0");
    } catch {}
  };

  // Counter via abacus.jasoncameron.dev (free public counter, no signup)
  const COUNTER_NS = "iamyareliza-com";
  const COUNTER_KEY = "plays";
  const formatCount = (n) => {
    if (n == null) return "—";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toString();
  };
  const renderPlays = (n) => {
    if (!playsEl) return;
    playsEl.textContent = `${formatCount(n)} ${n === 1 ? "play" : "plays"}`;
  };
  const fetchPlays = async () => {
    try {
      const r = await fetch(`https://abacus.jasoncameron.dev/get/${COUNTER_NS}/${COUNTER_KEY}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      renderPlays(d.value);
    } catch {}
  };
  let alreadyCounted = false;
  const incrementPlays = async () => {
    if (alreadyCounted) return;
    alreadyCounted = true;
    try {
      const r = await fetch(`https://abacus.jasoncameron.dev/hit/${COUNTER_NS}/${COUNTER_KEY}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      renderPlays(d.value);
    } catch {}
  };
  fetchPlays();

  // Update timer + progress bar
  audio.addEventListener("loadedmetadata", () => {
    if (dur) dur.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    if (cur) cur.textContent = formatTime(audio.currentTime);
    if (fill && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      fill.style.width = `${pct}%`;
      if (slider) slider.setAttribute("aria-valuenow", Math.round(pct));
    }
  });

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  audio.addEventListener("play", () => {
    setPlaying(true);
    incrementPlays();
  });
  audio.addEventListener("pause", () => setPlaying(false));

  // Tap, drag (mouse + touch), and keyboard seek on the progress bar
  if (slider) {
    const bar = slider.querySelector(".player-bar");
    const target = bar || slider;
    let scrubbing = false;
    let wasPlaying = false;

    const seekToClient = (clientX) => {
      const rect = target.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (!audio.duration) return;
      audio.currentTime = ratio * audio.duration;
      if (fill) fill.style.width = `${ratio * 100}%`;
      if (cur) cur.textContent = formatTime(audio.currentTime);
      slider.setAttribute("aria-valuenow", Math.round(ratio * 100));
    };

    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      scrubbing = true;
      wasPlaying = !audio.paused;
      if (wasPlaying) audio.pause();
      slider.classList.add("scrubbing");
      try { slider.setPointerCapture(e.pointerId); } catch {}
      seekToClient(e.clientX);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!scrubbing) return;
      seekToClient(e.clientX);
    };
    const onUp = (e) => {
      if (!scrubbing) return;
      scrubbing = false;
      slider.classList.remove("scrubbing");
      try { slider.releasePointerCapture(e.pointerId); } catch {}
      if (wasPlaying) audio.play().catch(() => {});
    };

    slider.addEventListener("pointerdown", onDown);
    slider.addEventListener("pointermove", onMove);
    slider.addEventListener("pointerup", onUp);
    slider.addEventListener("pointercancel", onUp);
    slider.addEventListener("lostpointercapture", () => {
      scrubbing = false;
      slider.classList.remove("scrubbing");
    });

    slider.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      const step = audio.duration / 20;
      if (e.key === "ArrowRight") {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        audio.currentTime = Math.max(0, audio.currentTime - step);
        e.preventDefault();
      }
    });
  }

  // Resume across in-tab navigations within the session
  try {
    if (sessionStorage.getItem("bgm") === "1") {
      audio.play().catch(() => {});
    }
  } catch {}
})();
