(() => {
  const API_URL = "https://bsz.saop.cc/api";
  const counters = document.querySelectorAll(".page-view-counter[data-page-view-key]");

  if (!counters.length) return;

  const loadCounter = async (counter) => {
    const key = counter.dataset.pageViewKey;
    const method = counter.dataset.pageViewMode === "count" ? "POST" : "GET";
    const counterUrl = new URL(`/__views/${encodeURIComponent(key)}/`, window.location.origin).href;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(API_URL, {
        method,
        mode: "cors",
        credentials: "include",
        headers: { "x-bsz-referer": counterUrl },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      const value = result?.data?.page_pv;
      if (!result?.success || !Number.isFinite(value)) throw new Error("Invalid counter response");

      const valueElement = counter.querySelector("[data-page-view-value]");
      if (!valueElement) return;
      valueElement.textContent = new Intl.NumberFormat(document.documentElement.lang || undefined).format(value);
      counter.hidden = false;
    } catch (error) {
      console.debug("Page-view counter unavailable", error);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  counters.forEach(loadCounter);
})();
