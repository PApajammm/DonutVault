(() => {
  const detailsCard = document.querySelector("#title-details");
  const errorMessage = document.querySelector("#details-error");
  const feedback = document.querySelector("#details-feedback");
  const deleteButton = document.querySelector("#details-delete");
  const titleId = new URLSearchParams(window.location.search).get("id");
  let title;

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
      month: "long",
      day: "numeric",
    }).format(date);
  }

  function showError(message) {
    detailsCard.hidden = true;
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function render() {
    if (!titleId) {
      showError("No title was selected. Choose a title from your library or watch history.");
      return;
    }

    try {
      title = window.DonutVaultStorage.getAll().find((item) => item.id === titleId);
    } catch (error) {
      showError(`Unable to load your saved titles: ${error.message}`);
      return;
    }

    if (!title) {
      showError("This title could not be found in your saved collection. It may have been removed.");
      return;
    }

    errorMessage.hidden = true;
    detailsCard.hidden = false;
    document.title = `${title.title} | DonutVault`;
    document.querySelector("#details-category").textContent = title.category;
    document.querySelector("#details-title").textContent = title.title;
    document.querySelector("#details-status").textContent = title.status;
    document.querySelector("#details-year").textContent = title.year ? String(title.year) : "";

    const rating = Number(title.rating);
    const hasRating = title.rating !== undefined && title.rating !== null
      && title.rating !== "" && Number.isFinite(rating);
    const ratingElement = document.querySelector("#details-rating");
    ratingElement.textContent = hasRating ? `★ ${rating} / 10` : "";
    ratingElement.hidden = !hasRating;

    document.querySelector("#details-start-date").textContent = formatDate(title.startDate);
    document.querySelector("#details-finish-date").textContent = formatDate(title.finishDate);

    const poster = document.querySelector("#details-poster");
    poster.classList.remove("details-card__poster--fallback");
    poster.replaceChildren();
    poster.setAttribute("role", "img");
    poster.setAttribute("aria-label", `${title.title} poster`);

    if (typeof title.posterUrl === "string" && title.posterUrl.trim()) {
      const image = document.createElement("img");
      image.src = title.posterUrl;
      image.alt = `${title.title} poster`;
      image.addEventListener("error", () => {
        poster.classList.add("details-card__poster--fallback");
        poster.textContent = title.title.trim().slice(0, 1).toUpperCase();
        poster.setAttribute("aria-label", `No poster available for ${title.title}`);
      }, { once: true });
      poster.append(image);
    } else {
      poster.classList.add("details-card__poster--fallback");
      poster.textContent = title.title.trim().slice(0, 1).toUpperCase();
      poster.setAttribute("aria-label", `No poster available for ${title.title}`);
    }

    const notesSection = document.querySelector("#details-notes-section");
    const notes = typeof title.notes === "string" ? title.notes.trim() : "";
    notesSection.hidden = !notes;
    document.querySelector("#details-notes").textContent = notes;
    document.querySelector("#details-edit").href = `add-title.html?id=${encodeURIComponent(title.id)}`;
  }

  deleteButton.addEventListener("click", () => {
    if (!title || !window.confirm(`Permanently delete "${title.title}" from your collection?`)) {
      return;
    }

    try {
      if (!window.DonutVaultStorage.removeById(title.id)) {
        showError("This title is no longer in your saved collection.");
        return;
      }

      window.location.assign("library.html?deleted=1");
    } catch (error) {
      feedback.textContent = `Unable to delete this title: ${error.message}`;
      feedback.hidden = false;
    }
  });

  render();
})();
