(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Clean up any leftover audio session flag from the previous version
  try {
    sessionStorage.removeItem("bgm");
  } catch {}
})();
