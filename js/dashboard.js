(() => {
  const totalCount = document.querySelector("[data-stat='total']");
  const completedCount = document.querySelector("[data-stat='completed']");
  const watchingCount = document.querySelector("[data-stat='watching']");
  const recentEmpty = document.querySelector("#recent-empty");
  const recentList = document.querySelector("#recent-list");
  const errorMessage = document.querySelector("#dashboard-error");

  function createRecentItem(title) {
    const item = document.createElement("a");
    item.className = "recent-item";
    item.href = typeof title.id === "string" && title.id
      ? `details.html?id=${encodeURIComponent(title.id)}`
      : "library.html";

    const artwork = document.createElement("span");
    artwork.className = "recent-item__artwork";
    artwork.setAttribute("aria-hidden", "true");

    if (typeof title.posterUrl === "string" && title.posterUrl.trim()) {
      const image = document.createElement("img");
      image.src = title.posterUrl;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        artwork.classList.add("recent-item__artwork--fallback");
        image.remove();
      }, { once: true });
      artwork.append(image);
    } else {
      artwork.classList.add("recent-item__artwork--fallback");
      artwork.textContent = title.title.trim().slice(0, 1).toUpperCase();
    }

    const details = document.createElement("span");
    details.className = "recent-item__details";
    const name = document.createElement("span");
    name.className = "recent-item__name";
    name.textContent = title.title;
    const meta = document.createElement("span");
    meta.className = "recent-item__meta";
    meta.textContent = `${title.category} · ${title.status}`;
    details.append(name, meta);

    const arrow = document.createElement("span");
    arrow.className = "recent-item__arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");
    item.append(artwork, details, arrow);
    return item;
  }

  function render() {
    try {
      const titles = window.DonutVaultStorage.getAll();
      totalCount.textContent = String(titles.length);
      completedCount.textContent = String(titles.filter((title) => title.status === "Completed").length);
      watchingCount.textContent = String(titles.filter((title) => title.status === "Currently Watching").length);
      errorMessage.hidden = true;

      const recentTitles = titles
        .slice()
        .sort((left, right) => {
          const leftDate = Date.parse(left.createdAt || "");
          const rightDate = Date.parse(right.createdAt || "");
          return (Number.isNaN(rightDate) ? 0 : rightDate) - (Number.isNaN(leftDate) ? 0 : leftDate);
        })
        .slice(0, 4);

      recentEmpty.hidden = recentTitles.length > 0;
      recentList.hidden = recentTitles.length === 0;
      recentList.replaceChildren(...recentTitles.map(createRecentItem));
    } catch (error) {
      totalCount.textContent = "—";
      completedCount.textContent = "—";
      watchingCount.textContent = "—";
      errorMessage.textContent = `Unable to load your saved collection: ${error.message}`;
      errorMessage.hidden = false;
      recentEmpty.hidden = true;
      recentList.hidden = true;
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "donutVault.titles" || event.key === null) {
      render();
    }
  });

  render();
})();
