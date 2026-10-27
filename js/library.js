(() => {
  const searchInput = document.querySelector("#title-search");
  const categoryFilter = document.querySelector("#category-filter");
  const statusFilter = document.querySelector("#status-filter");
  const sortOrder = document.querySelector("#sort-order");
  const titleGrid = document.querySelector("#title-grid");
  const libraryCount = document.querySelector("#library-count");
  const emptyState = document.querySelector("#library-empty");
  const emptyTitle = document.querySelector("#empty-title");
  const emptyCopy = document.querySelector("#empty-copy");
  const emptyAction = document.querySelector("#empty-action");
  const clearFiltersButton = document.querySelector("#clear-filters");
  const errorMessage = document.querySelector("#library-error");
  const actionFeedback = document.querySelector("#library-feedback");

  const savedAction = new URLSearchParams(window.location.search).get("saved");
  const wasDeleted = new URLSearchParams(window.location.search).get("deleted") === "1";
  if (savedAction === "added" || savedAction === "updated") {
    actionFeedback.textContent = savedAction === "added"
      ? "Title saved to your library."
      : "Title changes saved.";
    actionFeedback.hidden = false;
  } else if (wasDeleted) {
    actionFeedback.textContent = "Title deleted from your library.";
    actionFeedback.hidden = false;
  }

  function readTitles() {
    return window.DonutVaultStorage.getAll();
  }

  function compareByDate(left, right) {
    const leftDate = Date.parse(left.createdAt || "");
    const rightDate = Date.parse(right.createdAt || "");
    return (Number.isNaN(rightDate) ? 0 : rightDate) - (Number.isNaN(leftDate) ? 0 : leftDate);
  }

  function compareByRating(left, right) {
    const leftRating = Number(left.rating);
    const rightRating = Number(right.rating);
    const hasLeftRating = left.rating !== undefined && left.rating !== null && left.rating !== ""
      && Number.isFinite(leftRating);
    const hasRightRating = right.rating !== undefined && right.rating !== null && right.rating !== ""
      && Number.isFinite(rightRating);

    if (hasLeftRating !== hasRightRating) {
      return hasLeftRating ? -1 : 1;
    }

    return hasRightRating ? rightRating - leftRating : left.title.localeCompare(right.title);
  }

  function createPoster(title) {
    const poster = document.createElement("div");
    poster.className = "title-card__poster";
    poster.setAttribute("role", "img");
    poster.setAttribute("aria-label", `${title.title} poster`);

    function showFallback() {
      poster.classList.add("title-card__poster--fallback");
      const initials = document.createElement("span");
      initials.textContent = title.title.trim().slice(0, 1).toUpperCase();
      initials.setAttribute("aria-hidden", "true");
      poster.replaceChildren(initials);
      poster.setAttribute("aria-label", `No poster available for ${title.title}`);
    }

    if (typeof title.posterUrl === "string" && title.posterUrl.trim()) {
      const image = document.createElement("img");
      image.src = title.posterUrl;
      image.alt = `${title.title} poster`;
      image.loading = "lazy";
      image.addEventListener("error", () => {
        showFallback();
      }, { once: true });
      poster.append(image);
    } else {
      showFallback();
    }

    return poster;
  }

  function createCard(title) {
    const card = document.createElement("article");
    card.className = "title-card";
    const poster = createPoster(title);
    if (typeof title.id === "string" && title.id) {
      const posterLink = document.createElement("a");
      posterLink.className = "title-card__details-link";
      posterLink.href = `details.html?id=${encodeURIComponent(title.id)}`;
      posterLink.setAttribute("aria-label", `View details for ${title.title}`);
      posterLink.append(poster);
      card.append(posterLink);
    } else {
      card.append(poster);
    }

    const body = document.createElement("div");
    body.className = "title-card__body";

    const meta = document.createElement("div");
    meta.className = "title-card__meta";

    const category = document.createElement("span");
    category.className = "title-card__category";
    category.textContent = title.category;
    meta.append(category);

    if (title.year !== undefined && title.year !== null && String(title.year).trim()) {
      const year = document.createElement("span");
      year.className = "title-card__year";
      year.textContent = String(title.year);
      meta.append(year);
    }

    const heading = document.createElement("h2");
    heading.className = "title-card__name";
    if (typeof title.id === "string" && title.id) {
      const detailLink = document.createElement("a");
      detailLink.href = `details.html?id=${encodeURIComponent(title.id)}`;
      detailLink.textContent = title.title;
      heading.append(detailLink);
    } else {
      heading.textContent = title.title;
    }

    const footer = document.createElement("div");
    footer.className = "title-card__footer";

    const status = document.createElement("span");
    status.className = "status-badge";
    status.textContent = title.status;
    footer.append(status);

    const rating = Number(title.rating);
    if (title.rating !== undefined && title.rating !== null && title.rating !== "" && Number.isFinite(rating)) {
      const ratingLabel = document.createElement("span");
      ratingLabel.className = "title-card__rating";
      ratingLabel.textContent = `★ ${rating}`;
      ratingLabel.setAttribute("aria-label", `Rating ${rating} out of 10`);
      footer.append(ratingLabel);
    }

    if (typeof title.id === "string" && title.id) {
      const editLink = document.createElement("a");
      editLink.className = "title-card__edit";
      editLink.href = `add-title.html?id=${encodeURIComponent(title.id)}`;
      editLink.textContent = "Edit";
      editLink.setAttribute("aria-label", `Edit ${title.title}`);
      footer.append(editLink);
    }

    body.append(meta, heading, footer);
    card.append(body);
    return card;
  }

  function showEmptyState(filtered) {
    titleGrid.hidden = true;
    emptyState.hidden = false;
    emptyAction.hidden = filtered;
    clearFiltersButton.hidden = !filtered;

    if (filtered) {
      emptyTitle.textContent = "No titles match those filters";
      emptyCopy.textContent = "Try another search or clear a filter to see more of your collection.";
    } else {
      emptyTitle.textContent = "Your library is waiting";
      emptyCopy.textContent = "Add your first anime, movie, or series to start building your personal collection.";
      emptyAction.textContent = "Add your first title";
    }
  }

  function render() {
    let titles;

    try {
      titles = readTitles();
      errorMessage.hidden = true;
    } catch (error) {
      titleGrid.replaceChildren();
      titleGrid.hidden = true;
      emptyState.hidden = true;
      libraryCount.textContent = "";
      errorMessage.textContent = `Unable to load your saved titles: ${error.message}`;
      errorMessage.hidden = false;
      return;
    }

    const query = searchInput.value.trim().toLocaleLowerCase();
    const category = categoryFilter.value;
    const status = statusFilter.value;
    const filteredTitles = titles.filter((title) => (
      title.title.toLocaleLowerCase().includes(query)
      && (!category || title.category === category)
      && (!status || title.status === status)
    ));

    if (sortOrder.value === "title") {
      filteredTitles.sort((left, right) => left.title.localeCompare(right.title));
    } else if (sortOrder.value === "rating") {
      filteredTitles.sort(compareByRating);
    } else {
      filteredTitles.sort(compareByDate);
    }

    libraryCount.textContent = filteredTitles.length === titles.length
      ? `${titles.length} ${titles.length === 1 ? "title" : "titles"}`
      : `${filteredTitles.length} of ${titles.length} titles`;

    if (filteredTitles.length === 0) {
      titleGrid.replaceChildren();
      showEmptyState(titles.length > 0);
      return;
    }

    emptyState.hidden = true;
    titleGrid.hidden = false;
    titleGrid.replaceChildren(...filteredTitles.map(createCard));
  }

  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);
  sortOrder.addEventListener("change", render);
  clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    statusFilter.value = "";
    sortOrder.value = "recent";
    render();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "donutVault.titles" || event.key === null) {
      render();
    }
  });

  window.addEventListener("donutvault:collection-updated", render);

  render();
})();
