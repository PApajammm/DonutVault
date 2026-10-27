(() => {
  const maximumFileSize = 5 * 1024 * 1024;
  const exportButton = document.querySelector("#export-collection");
  const importButton = document.querySelector("#choose-import");
  const fileInput = document.querySelector("#import-file");
  const feedback = document.querySelector("#transfer-feedback");

  function showFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.classList.toggle("action-feedback--error", isError);
    feedback.hidden = false;
  }

  function createFileName() {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    return `donutvault-collection-${date}.json`;
  }

  exportButton.addEventListener("click", () => {
    try {
      const data = window.DonutVaultStorage.createExport();
      const file = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
        type: "application/json",
      });
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = createFileName();
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      showFeedback(`Exported ${data.titles.length} ${data.titles.length === 1 ? "title" : "titles"} to JSON.`);
    } catch (error) {
      showFeedback(`Unable to export your collection: ${error.message}`, true);
    }
  });

  importButton.addEventListener("click", () => {
    feedback.hidden = true;
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const [file] = fileInput.files || [];
    if (!file) {
      return;
    }

    if (file.size > maximumFileSize) {
      showFeedback("This JSON file is larger than the 5 MB import limit.", true);
      fileInput.value = "";
      return;
    }

    let importData;
    let importedTitles;
    try {
      const contents = await file.text();
      importData = JSON.parse(contents);
      importedTitles = window.DonutVaultStorage.validateImport(importData);
    } catch (error) {
      showFeedback(`Import not applied: ${error.message}`, true);
      fileInput.value = "";
      return;
    }

    let currentCount;
    try {
      currentCount = window.DonutVaultStorage.getAll().length;
    } catch (error) {
      showFeedback(`Import not applied: unable to read your current collection. ${error.message}`, true);
      fileInput.value = "";
      return;
    }
    const titleCount = importedTitles.length;
    const titleLabel = titleCount === 1 ? "title" : "titles";
    const accepted = window.confirm(
      `Replace your current collection of ${currentCount} ${currentCount === 1 ? "title" : "titles"} `
      + `with ${titleCount} ${titleLabel} from "${file.name}"? This cannot be undone.`,
    );

    if (!accepted) {
      showFeedback("Import cancelled. Your current collection was not changed.");
      fileInput.value = "";
      return;
    }

    try {
      const savedCount = window.DonutVaultStorage.importTitles(importData);
      showFeedback(`Imported ${savedCount} ${savedCount === 1 ? "title" : "titles"} successfully.`);
      window.dispatchEvent(new CustomEvent("donutvault:collection-updated"));
      fileInput.value = "";
    } catch (error) {
      showFeedback(`Unable to import your collection: ${error.message}`, true);
      fileInput.value = "";
    }
  });
})();
