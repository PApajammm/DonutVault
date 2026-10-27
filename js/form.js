(() => {
  const form = document.querySelector("#title-form");
  const feedback = document.querySelector("#form-feedback");
  const titleField = form.elements.title;
  const categoryField = form.elements.category;
  const yearField = form.elements.year;
  const posterField = form.elements.posterUrl;
  const statusField = form.elements.status;
  const startDateField = form.elements.startDate;
  const finishDateField = form.elements.finishDate;
  const ratingField = form.elements.rating;
  const dateError = document.querySelector("#date-error");
  const query = new URLSearchParams(window.location.search);
  const editId = query.get("id");
  let originalTitle;

  function showFeedback(message, isError = true) {
    feedback.textContent = message;
    feedback.classList.toggle("form-feedback--success", !isError);
    feedback.hidden = false;
  }

  function clearFieldError(field, errorId) {
    field.removeAttribute("aria-invalid");
    document.querySelector(`#${errorId}`).textContent = "";
  }

  function setFieldError(field, errorId, message) {
    field.setAttribute("aria-invalid", "true");
    document.querySelector(`#${errorId}`).textContent = message;
  }

  function populateForm(title) {
    titleField.value = title.title;
    categoryField.value = title.category;
    yearField.value = title.year ?? "";
    posterField.value = title.posterUrl ?? "";
    statusField.value = title.status || "Plan to Watch";
    startDateField.value = title.startDate ?? "";
    finishDateField.value = title.finishDate ?? "";
    ratingField.value = title.rating ?? "";
    form.elements.notes.value = title.notes ?? "";
  }

  function setEditMode() {
    let titles;

    try {
      titles = window.DonutVaultStorage.getAll();
    } catch (error) {
      showFeedback(`Unable to load your saved titles: ${error.message}`);
      form.querySelectorAll("input, select, textarea, button[type='submit']").forEach((field) => {
        field.disabled = true;
      });
      return;
    }

    originalTitle = titles.find((title) => title.id === editId);

    if (!originalTitle) {
      showFeedback("This title could not be found in your saved collection. It may have been removed.");
      form.querySelectorAll("input, select, textarea, button[type='submit']").forEach((field) => {
        field.disabled = true;
      });
      return;
    }

    document.title = "Edit Title | DonutVault";
    const heading = document.querySelector("#page-title");
    const highlightedTitle = document.createElement("span");
    highlightedTitle.textContent = "Title";
    heading.replaceChildren(document.createTextNode("Edit a "), highlightedTitle);
    document.querySelector(".form-heading > p:not(.eyebrow)").textContent = "Update the details in your personal watch archive.";
    form.querySelector("button[type='submit']").textContent = "Save changes";
    populateForm(originalTitle);
  }

  function validate() {
    let isValid = true;
    const title = titleField.value.trim();
    const category = categoryField.value;
    const year = yearField.value.trim();
    const posterUrl = posterField.value.trim();
    const rating = ratingField.value.trim();

    clearFieldError(titleField, "title-error");
    clearFieldError(categoryField, "category-error");
    clearFieldError(yearField, "year-error");
    clearFieldError(posterField, "posterUrl-error");
    clearFieldError(ratingField, "rating-error");
    dateError.textContent = "";
    startDateField.removeAttribute("aria-invalid");
    finishDateField.removeAttribute("aria-invalid");

    if (!title) {
      setFieldError(titleField, "title-error", "Enter a title.");
      isValid = false;
    }

    if (!category) {
      setFieldError(categoryField, "category-error", "Choose a category.");
      isValid = false;
    }

    if (year) {
      const numericYear = Number(year);
      if (!Number.isInteger(numericYear) || numericYear < 1888 || numericYear > new Date().getFullYear() + 10) {
        setFieldError(yearField, "year-error", `Enter a year from 1888 to ${new Date().getFullYear() + 10}.`);
        isValid = false;
      }
    }

    if (posterUrl) {
      try {
        const poster = new URL(posterUrl);
        if (poster.protocol !== "http:" && poster.protocol !== "https:") {
          throw new Error("Unsupported image URL protocol.");
        }
      } catch {
        setFieldError(posterField, "posterUrl-error", "Enter a valid http or https image URL.");
        isValid = false;
      }
    }

    if (rating) {
      const numericRating = Number(rating);
      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 10 || numericRating * 2 % 1 !== 0) {
        setFieldError(ratingField, "rating-error", "Enter a rating from 1 to 10 in half-point steps.");
        isValid = false;
      }
    }

    const startDate = startDateField.value;
    const finishDate = finishDateField.value;
    if ((startDate && Number.isNaN(Date.parse(`${startDate}T00:00:00`)))
      || (finishDate && Number.isNaN(Date.parse(`${finishDate}T00:00:00`)))
      || (startDate && finishDate && finishDate < startDate)) {
      dateError.textContent = startDate && finishDate && finishDate < startDate
        ? "Finish date must be the same as or later than the start date."
        : "Enter valid start and finish dates.";
      if (startDate && finishDate && finishDate < startDate) {
        finishDateField.setAttribute("aria-invalid", "true");
      }
      isValid = false;
    }

    return isValid;
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `title-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getFormTitle() {
    const year = yearField.value.trim();
    const rating = ratingField.value.trim();

    return {
      ...(originalTitle || {}),
      id: originalTitle ? originalTitle.id : makeId(),
      title: titleField.value.trim(),
      category: categoryField.value,
      posterUrl: posterField.value.trim(),
      year: year ? Number(year) : "",
      status: statusField.value,
      startDate: startDateField.value,
      finishDate: finishDateField.value,
      rating: rating ? Number(rating) : "",
      notes: form.elements.notes.value.trim(),
      createdAt: originalTitle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  form.addEventListener("input", (event) => {
    const errorIds = {
      title: "title-error",
      year: "year-error",
      posterUrl: "posterUrl-error",
      rating: "rating-error",
    };
    const errorId = errorIds[event.target.name];
    if (errorId) {
      clearFieldError(event.target, errorId);
      feedback.hidden = true;
    }

    if (event.target.name === "startDate" || event.target.name === "finishDate") {
      dateError.textContent = "";
      startDateField.removeAttribute("aria-invalid");
      finishDateField.removeAttribute("aria-invalid");
      feedback.hidden = true;
    }
  });

  form.addEventListener("change", (event) => {
    if (event.target === categoryField) {
      clearFieldError(categoryField, "category-error");
      feedback.hidden = true;
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.hidden = true;

    if (!validate()) {
      showFeedback("Please correct the highlighted fields before saving.");
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }

    try {
      const titles = window.DonutVaultStorage.getAll();
      const updatedTitle = getFormTitle();
      let nextTitles;

      if (originalTitle) {
        const titleIndex = titles.findIndex((title) => title.id === originalTitle.id);
        if (titleIndex === -1) {
          throw new Error("This title is no longer in your saved collection. Reload the page before editing.");
        }
        nextTitles = titles.slice();
        nextTitles[titleIndex] = updatedTitle;
      } else {
        nextTitles = [...titles, updatedTitle];
      }

      window.DonutVaultStorage.saveAll(nextTitles);
      window.location.assign(`library.html?saved=${originalTitle ? "updated" : "added"}`);
    } catch (error) {
      showFeedback(`Unable to save this title: ${error.message}`);
    }
  });

  if (editId) {
    setEditMode();
  }
})();
