# DonutVault - Project Background and Development Tasks

## Project Overview

DonutVault is a personal Web Watch Archive for organizing, recording, and managing anime, movies, and series watched by its owner. The name combines "Donut," the owner's username, with "Vault," a personal collection of saved titles and viewing history.

The initial version is for individual use and must run locally in a browser. Use HTML, CSS, vanilla JavaScript, and browser LocalStorage. Do not add a database, backend, authentication, or unnecessary frameworks.

## Design Direction

- Dark, cinematic appearance with a near-black or charcoal background.
- Muted crimson accent, dark-gray surfaces and borders, and soft-white/light-gray text.
- Clean, modern, organized, and comfortable for extended viewing.
- Avoid bright red, excessive glow, harsh contrast, unnecessary animation, and fake user data.
- Keep design consistent and responsive across desktop, tablet, and mobile.

## Core Features

### 1. Main Dashboard

- DonutVault branding and navigation.
- Welcome section and short description.
- Summary cards for total saved, completed, and currently watching titles.
- Recently added titles and quick access to the watch library.
- First-time empty state when no titles exist.

### 2. Watch Library

- Cards show poster/cover, title, category, optional release year, watch status, and optional personal rating.
- Search by title; filter by category and watch status.
- Sort by recently added, title, or rating.
- Show a clear empty state when no titles match.

### 3. Add and Edit Titles

- Required: title and category.
- Optional: poster image URL, release year, start date, finish date, personal rating, and notes.
- Categories: Anime Series, Anime Movies, English Movies, Tagalog Movies, Other Series.
- Statuses: Plan to Watch, Currently Watching, Completed, On Hold, Dropped.
- Validate required fields and dates, load existing values when editing, and allow cancellation without saving.

### 4. Watch History

- Store one start date and one finish date per title in the initial version.
- Display and allow editing of these dates.
- Show completed titles in watch history.
- Do not build multiple-watch tracking in the initial version.

### 5. Title Details

- Show poster, title, category, optional year, status, dates, optional rating, and notes.
- Provide edit and delete actions; confirm before permanent deletion.
- Details may be a dedicated page or modal.

### 6. Data Persistence

- Persist entries in browser LocalStorage across refreshes and browser restarts.
- Adding, editing, and deleting must update saved data and dashboard statistics.
- Search, filtering, and sorting operate on saved entries.
- Handle missing or invalid stored data gracefully.
- Adding a title must not overwrite existing entries.
- Support JSON export and validated JSON import. Exported backups use the versioned `donutvault-collection` JSON format; imports validate every title before asking confirmation to replace the current collection.
- Reject unsupported or invalid import files without changing the saved collection. Limit import files to 5 MB.
- Explain that LocalStorage belongs to the current browser and device and does not synchronize between devices.

### 7. Navigation and Usability

- Working Dashboard, Watch Library, Watch History, and Add Title navigation.
- Consistent navigation, accessible labels, and keyboard-friendly controls.
- Clear validation messages, deletion confirmation, helpful empty states, and success feedback.
- Do not include non-functional buttons or present fake data as the user's own.

### 8. Final Testing and Cleanup

Verify adding anime and movie entries; editing an entry; changing status; recording dates; searching; category and status filters; sorting; confirmed deletion; persistence after refresh; export and import; desktop and mobile layouts; JavaScript errors; navigation; and dashboard statistics.

## Technical Requirements

- HTML for structure, CSS for styling, and vanilla JavaScript for application logic.
- LocalStorage for persistence; no backend or database in the initial version.
- Keep application logic split into maintainable files rather than one large script.
- Suggested files include `index.html`, `library.html`, `history.html`, `css/style.css`, and focused modules under `js/`. The structure may be adjusted when simpler and more maintainable.
- The site must work locally without a paid service.

## Development Rules

1. Inspect existing project files before changes; establish a structure first if empty.
2. Build the layout and design system before complex functionality.
3. Implement in small, testable stages and complete each stage before moving on.
4. Keep a consistent palette and responsive behavior.
5. Preserve working features when extending the app.
6. Avoid unnecessary dependencies and out-of-scope features.
7. Test the requested behavior, fix errors, and polish responsive design.
8. Update this document's progress log whenever project tasks or phases are completed.

## Recommended Development Order

1. Phase 1: Project structure and dark visual theme.
2. Phase 2: Dashboard and navigation.
3. Phase 3: Watch library, cards, search, filters, and sorting.
4. Phase 4: Add and edit forms.
5. Phase 5: LocalStorage and automatic dashboard statistics.
6. Phase 6: Title details, watch history, and delete confirmation.
7. Phase 7: JSON import and export.
8. Phase 8: End-to-end testing, fixes, and responsive polish.

## Expected Result

A functional personal watch archive that opens locally in a browser and lets its owner add, organize, and update titles; track viewing dates; inspect watch history; and retain the collection after refreshing. Prioritize a working application, clear code, and polished usability over unnecessary features.

## Progress Log

Update this log and the phase checklist after each completed project task. Keep the latest status and validation evidence here.

| Date | Phase / task | Status | Notes |
|---|---|---|---|
| 2026-10-28 | Phase 1: project structure and visual theme | Complete | Added the branded landing page and responsive dark theme. Reused `logo.jfif` as the large artwork logo and tightened desktop/mobile side spacing. Browser rendering, logo load, and mobile overflow were checked. |
| 2026-10-28 | Phase 2: dashboard and navigation | Complete | Replaced the landing page with a dashboard featuring collection summary cards, a recently-added empty state, and a library shortcut. Added consistent navigation and linked placeholder pages for the library, history, and add-title destinations; those features remain in their scheduled phases. Verified all four pages load, dashboard summary and navigation render, and mobile layout has no horizontal overflow. |
| 2026-10-28 | Phase 3: watch library and discovery controls | Complete | Added a responsive title-card grid, poster fallback, search, category/status filters, recently-added/title/rating sorts, result counts, and separate empty/no-match states with a working clear-filters action. The page reads `donutVault.titles` without changing it and reports malformed stored data. Browser checks covered fixture cards, search, filters, sorts, empty states, broken-poster fallback, malformed data, and mobile layout; test data was removed afterward. |
| 2026-10-28 | Phase 4: add and edit titles | Complete | Replaced the placeholder with a validated add/edit form for category, poster, year, status, dates, rating, and notes. Added library edit links, cancellation, date ordering checks, and save feedback. Browser-verified required-field/date validation, adding both anime and movie entries, edit prefill/update, and no duplicate on edit. |
| 2026-10-28 | Phase 5: LocalStorage and dashboard statistics | Complete | Added a shared LocalStorage module using `donutVault.titles`, safe append/update behavior, created/updated timestamps, persistence after refresh, cross-tab refresh listeners, and dashboard total/completed/currently-watching counts plus recent entries. Added visible browser/device-only storage guidance and explicit malformed-data errors. Browser-verified two saved entries, refresh persistence, status-driven statistics, edit without duplication, malformed-data messages, and mobile form/library layouts; original browser storage was restored after testing. |
| 2026-10-28 | Phase 6: title details, watch history, and deletion | Complete | Added a dedicated details page linked from title cards, dashboard recent items, and history. Details show poster, category, year, status, dates, rating, notes, and edit/delete actions. Watch History now lists completed titles by finish date, with start/finish dates and empty/error states. Added a deletion confirmation and storage removal helper. Browser-verified displayed details and dates, history filtering, confirmed deletion and dismissal behavior, edit links, missing-date handling, and mobile layouts; temporary collection data was removed afterward. |
| 2026-10-28 | Phase 7: JSON import and export | Complete | Added a versioned JSON export download and file import controls to the library. Imports validate the format, title fields, enums, IDs, dates, timestamps, year, rating, URL, notes, and a 5 MB size limit before asking for confirmation to replace the saved collection. Invalid files and cancelled imports leave existing titles unchanged and show feedback. Browser-verified export structure/download payload, invalid import rejection, cancelled and confirmed replacement, dashboard refresh after import, actual file chooser opening, and removal of temporary test data. |

### Phase Checklist

- [x] Phase 1: Project structure and dark visual theme
- [x] Phase 2: Dashboard and navigation
- [x] Phase 3: Watch library and discovery controls
- [x] Phase 4: Add and edit titles
- [x] Phase 5: LocalStorage and dashboard statistics
- [x] Phase 6: Details, watch history, and deletion
- [x] Phase 7: JSON import and export
- [ ] Phase 8: End-to-end testing and polish
