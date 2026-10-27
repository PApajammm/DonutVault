(() => {
  const historyList = document.querySelector("#history-list");
  const historyCount = document.querySelector("#history-count");
  const emptyState = document.querySelector("#history-empty");
  const emptyTitle = document.querySelector("#history-empty-title");
  const emptyCopy = document.querySelector("#history-empty-copy");
  const emptyAction = document.querySelector("#history-empty-action");
  const errorMessage = document.querySelector("#history-error");

  function formatDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "Not recorded";
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return "Not recorded";
    }

    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  function createHistoryItem(title) {
    const item = document.createElement("article");
    item.className = "history-item";

    const poster = document.createElement("span");
    poster.className = "history-item__poster";
    poster.setAttribute("aria-hidden", "true");

    if (typeof title.posterUrl === "string" && title.posterUrl.trim()) {
      const image = document.createElement("img");
      image.src = title.posterUrl;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        poster.classList.add("history-item__poster--fallback");
        poster.textContent = title.title.trim().slice(0, 1).toUpperCase();
      }, { once: true });
      poster.append(image);
    } else {
      poster.classList.add("history-item__poster--fallback");
      poster.textContent = title.title.trim().slice(0, 1).toUpperCase();
    }

    const information = document.createElement("div");
    information.className = "history-item__information";
    const category = document.createElement("span");
    category.className = "title-card__category";
    category.textContent = title.category;
    const heading = document.createElement("h2");
    const detailLink = document.createElement("a");
    detailLink.href = `details.html?id=${encodeURIComponent(title.id)}`;
    detailLink.textContent = title.title;
    heading.append(detailLink);
    const dates = document.createElement("div");
    dates.className = "history-item__dates";

    const start = document.createElement("span");
    start.textContent = `Started ${formatDate(title.startDate)}`;
    const finish = document.createElement("span");
    finish.textContent = `Finished ${formatDate(title.finishDate)}`;
    dates.append(start, finish);
    information.append(category, heading, dates);

    const status = document.createElement("span");
    status.className = "status-badge";
    status.textContent = "Completed";

    item.append(poster, information, status);
    return item;
  }

  function render() {
    try {
      const completed = window.DonutVaultStorage.getAll()
        .filter((title) => title.status === "Completed")
        .sort((left, right) => {
          const leftDate = Date.parse(`${left.finishDate || ""}T00:00:00`);
          const rightDate = Date.parse(`${right.finishDate || ""}T00:00:00`);
          const safeLeft = Number.isNaN(leftDate) ? 0 : leftDate;
          const safeRight = Number.isNaN(rightDate) ? 0 : rightDate;
          return safeRight - safeLeft;
        });

      errorMessage.hidden = true;
      historyCount.textContent = `${completed.length} completed ${completed.length === 1 ? "title" : "titles"}`;
      historyList.hidden = completed.length === 0;
      emptyState.hidden = completed.length > 0;

      if (completed.length === 0) {
        emptyTitle.textContent = "No completed titles yet";
        emptyCopy.textContent = "When you mark a title as completed, it will appear here with your watch dates.";
        emptyAction.textContent = "Explore your library";
      } else {
        historyList.replaceChildren(...completed.map(createHistoryItem));
      }
    } catch (error) {
      historyList.replaceChildren();
      historyList.hidden = true;
      emptyState.hidden = true;
      historyCount.textContent = "";
      errorMessage.textContent = `Unable to load your watch history: ${error.message}`;
      errorMessage.hidden = false;
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "donutVault.titles" || event.key === null) {
      render();
    }
  });

  render();
})();
