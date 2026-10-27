(() => {
  const storageKey = "donutVault.titles";
  const exportFormat = "donutvault-collection";
  const categories = new Set([
    "Anime Series",
    "Anime Movies",
    "English Movies",
    "Tagalog Movies",
    "Other Series",
  ]);
  const statuses = new Set([
    "Plan to Watch",
    "Currently Watching",
    "Completed",
    "On Hold",
    "Dropped",
  ]);

  function isValidDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function validateTitles(titles) {
    if (!Array.isArray(titles) || titles.some((title) => (
      !title
      || typeof title.title !== "string"
      || typeof title.category !== "string"
      || typeof title.status !== "string"
    ))) {
      throw new Error("Saved library data has an unexpected format.");
    }

    return titles;
  }

  function getAll() {
    const storedTitles = localStorage.getItem(storageKey);

    if (storedTitles === null) {
      return [];
    }

    return validateTitles(JSON.parse(storedTitles));
  }

  function saveAll(titles) {
    validateTitles(titles);
    localStorage.setItem(storageKey, JSON.stringify(titles));
  }

  function removeById(id) {
    if (typeof id !== "string" || !id) {
      throw new Error("A valid title ID is required.");
    }

    const titles = getAll();
    const nextTitles = titles.filter((title) => title.id !== id);

    if (nextTitles.length === titles.length) {
      return false;
    }

    saveAll(nextTitles);
    return true;
  }

  function createExport() {
    return {
      format: exportFormat,
      version: 1,
      exportedAt: new Date().toISOString(),
      titles: getAll(),
    };
  }

  function validateImport(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("The file must contain a DonutVault JSON collection.");
    }

    if (data.format !== exportFormat || data.version !== 1) {
      throw new Error("This file is not a supported DonutVault export (format version 1).");
    }
    if (typeof data.exportedAt !== "string" || Number.isNaN(Date.parse(data.exportedAt))) {
      throw new Error("The export is missing a valid export date.");
    }

    if (!Array.isArray(data.titles)) {
      throw new Error("The export must contain a titles array.");
    }

    const ids = new Set();
    const titles = data.titles.map((title, index) => {
      const row = index + 1;
      if (!title || typeof title !== "object" || Array.isArray(title)) {
        throw new Error(`Title ${row} must be a JSON object.`);
      }

      if (typeof title.id !== "string" || !title.id.trim()) {
        throw new Error(`Title ${row} is missing a valid ID.`);
      }
      const id = title.id.trim();
      if (ids.has(id)) {
        throw new Error(`Title ${row} has a duplicate ID.`);
      }
      ids.add(id);

      if (typeof title.title !== "string" || !title.title.trim() || title.title.length > 160) {
        throw new Error(`Title ${row} needs a non-empty name of at most 160 characters.`);
      }
      if (!categories.has(title.category)) {
        throw new Error(`Title ${row} has an unsupported category.`);
      }
      if (!statuses.has(title.status)) {
        throw new Error(`Title ${row} has an unsupported watch status.`);
      }

      const posterUrl = title.posterUrl ?? "";
      if (typeof posterUrl !== "string" || posterUrl.length > 2048) {
        throw new Error(`Title ${row} has an invalid poster URL.`);
      }
      if (posterUrl) {
        let parsedUrl;
        try {
          parsedUrl = new URL(posterUrl);
        } catch {
          throw new Error(`Title ${row} has an invalid poster URL.`);
        }
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          throw new Error(`Title ${row} poster URL must use http or https.`);
        }
      }

      const year = title.year ?? "";
      if (year !== "" && (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear() + 10)) {
        throw new Error(`Title ${row} has an invalid release year.`);
      }

      const rating = title.rating ?? "";
      if (rating !== "" && (!Number.isFinite(rating) || rating < 1 || rating > 10 || rating * 2 % 1 !== 0)) {
        throw new Error(`Title ${row} has an invalid rating.`);
      }

      const startDate = title.startDate ?? "";
      const finishDate = title.finishDate ?? "";
      if ((startDate && !isValidDate(startDate)) || (finishDate && !isValidDate(finishDate))) {
        throw new Error(`Title ${row} has an invalid watch date.`);
      }
      if (startDate && finishDate && finishDate < startDate) {
        throw new Error(`Title ${row} finishes before its start date.`);
      }

      const notes = title.notes ?? "";
      if (typeof notes !== "string" || notes.length > 2000) {
        throw new Error(`Title ${row} has invalid notes.`);
      }

      if (typeof title.createdAt !== "string" || Number.isNaN(Date.parse(title.createdAt))) {
        throw new Error(`Title ${row} is missing a valid creation timestamp.`);
      }
      if (typeof title.updatedAt !== "string" || Number.isNaN(Date.parse(title.updatedAt))) {
        throw new Error(`Title ${row} is missing a valid update timestamp.`);
      }

      return {
        id,
        title: title.title.trim(),
        category: title.category,
        posterUrl,
        year,
        status: title.status,
        startDate,
        finishDate,
        rating,
        notes,
        createdAt: title.createdAt,
        updatedAt: title.updatedAt,
      };
    });

    return titles;
  }

  function importTitles(data) {
    const titles = validateImport(data);
    saveAll(titles);
    return titles.length;
  }

  window.DonutVaultStorage = Object.freeze({
    getAll,
    saveAll,
    removeById,
    createExport,
    validateImport,
    importTitles,
  });
})();
