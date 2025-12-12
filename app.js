// URL to your published Google Sheets CSV
const CSV_URL = "activities.csv"

let activities = [];       // all rows
let filterColumns = [];    // condition columns (to use as preferences)

// Helper: treat various values as "true-ish"
function isTruthy(value) {
  if (value === true) return true;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return ["true", "yes", "y", "1"].includes(v);
  }
  return false;
}

// Build filter controls (checkboxes) from filterColumns
function buildFilterControls() {
  const filtersDiv = document.getElementById("filters");
  filtersDiv.innerHTML = "";

  filterColumns.forEach((col) => {
    const label = document.createElement("label");
    label.className = "filter-chip";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = col;

    const text = document.createElement("span");
    text.textContent = col;

    label.appendChild(checkbox);
    label.appendChild(text);
    filtersDiv.appendChild(label);
  });
}

// Get selected filter keys
function getSelectedFilters() {
  const filtersDiv = document.getElementById("filters");
  const checkboxes = filtersDiv.querySelectorAll("input[type='checkbox']");
  const selected = [];

  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });

  return selected;
}

// Filter activities based on selected filterColumns
function getMatchingActivities(selectedFilters) {
  if (selectedFilters.length === 0) {
    // If nothing selected, everything is eligible
    return activities;
  }

  return activities.filter((row) =>
    selectedFilters.every((col) => isTruthy(row[col]))
  );
}

// Pick random element from array (or null if empty)
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// Display chosen activity
function showResult(activity) {
  const resultCard = document.getElementById("result-card");
  const nameElem = document.getElementById("result-name");
  const idElem = document.getElementById("result-id");
  const tagsContainer = document.getElementById("result-tags");

  if (!activity) {
    nameElem.textContent = "No matching activities found.";
    idElem.textContent = "";
    tagsContainer.innerHTML = "";
    resultCard.classList.remove("hidden");
    return;
  }

  // Try to find ID + Name columns dynamically
  const keys = Object.keys(activity);
  const idKey =
    keys.find((k) => k.toLowerCase().includes("activity id")) ||
    keys.find((k) => k.toLowerCase().includes("id")) ||
    null;
  const nameKey =
    keys.find((k) => k.toLowerCase().includes("name")) ||
    keys.find((k) => k.toLowerCase().includes("activity")) ||
    null;

  const name = nameKey ? activity[nameKey] : "(Unnamed activity)";
  const id = idKey ? activity[idKey] : "";

  nameElem.textContent = name;
  idElem.textContent = id ? `ID: ${id}` : "";

  // Show which tags were true for this activity
  tagsContainer.innerHTML = "";
  filterColumns.forEach((col) => {
    if (isTruthy(activity[col])) {
      const pill = document.createElement("span");
      pill.className = "tag-pill";
      pill.textContent = col;
      tagsContainer.appendChild(pill);
    }
  });

  resultCard.classList.remove("hidden");
}

// Handle pick button click
function handlePickClick() {
  const selectedFilters = getSelectedFilters();
  const matches = getMatchingActivities(selectedFilters);
  const chosen = pickRandom(matches);
  showResult(chosen);
}

// INITIALISATION: fetch + parse CSV, build UI
async function init() {
  const statusElem = document.getElementById("status");
  const controlsCard = document.getElementById("controls");
  const pickBtn = document.getElementById("pick-btn");
  const pickAgainBtn = document.getElementById("pick-again-btn");

  pickBtn.addEventListener("click", handlePickClick);
  pickAgainBtn.addEventListener("click", handlePickClick);

  try {
    statusElem.textContent = "Loading activities from Google Sheets...";

    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const csvText = await response.text();

    // Use PapaParse to convert CSV to array of objects
    const parsed = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    activities = parsed.data;

    if (!activities.length) {
      throw new Error("No data rows found in sheet.");
    }

    // Determine which columns are filters:
    // Take all headers except ones that look like ID/Name
    const sampleRow = activities[0];
    const allCols = Object.keys(sampleRow);

    const idLike = ["id", "activity id"];
    const nameLike = ["name", "activity name"];

    filterColumns = allCols.filter((col) => {
      const lc = col.toLowerCase();
      if (idLike.some((key) => lc.includes(key))) return false;
      if (nameLike.some((key) => lc.includes(key))) return false;
      return true;
    });

    buildFilterControls();

    statusElem.textContent = "Activities loaded. Choose your preferences below.";
    controlsCard.classList.remove("hidden");
    pickBtn.disabled = false;
  } catch (err) {
    console.error(err);
    statusElem.textContent =
      "Failed to load activities. Please check the sheet link or try again later.";
    statusElem.classList.add("error");
  }
}

document.addEventListener("DOMContentLoaded", init);

