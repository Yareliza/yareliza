(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Clean up any leftover audio session flag from the previous version
  try {
    sessionStorage.removeItem("bgm");
  } catch {}

  // Mobile video modal — lazy-loads the YouTube iframe on tap
  const trigger = document.querySelector(".video-trigger");
  const modal = document.getElementById("video-modal");
  if (trigger && modal) {
    const frame = modal.querySelector(".video-modal-frame");
    const videoId = trigger.dataset.videoId;

    const open = () => {
      if (!videoId) return;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      frame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' +
        videoId +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="Yareliza — Hallelujah" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      trigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      modal.hidden = true;
      document.body.style.overflow = "";
      frame.innerHTML = "";
      trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", open);
    modal.addEventListener("click", (e) => {
      if (e.target.dataset && "close" in e.target.dataset) close();
      if (e.target.closest && e.target.closest("[data-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }
})();
