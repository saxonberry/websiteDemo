// Example "data table" — this would be your Activities/conditions equivalent.
// All logic is client-side: nothing is fetched from a server.
const activities = [
  {
    id: 1,
    name: "Morning walk",
    category: "Health",
    difficulty: "Easy",
  },
  {
    id: 2,
    name: "Read 10 pages",
    category: "Learning",
    difficulty: "Easy",
  },
  {
    id: 3,
    name: "30-minute workout",
    category: "Health",
    difficulty: "Medium",
  },
  {
    id: 4,
    name: "Write journal entry",
    category: "Reflection",
    difficulty: "Easy",
  },
  {
    id: 5,
    name: "Try a new recipe",
    category: "Creative",
    difficulty: "Medium",
  },
];

// Render the table when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#activity-table tbody");

  activities.forEach((activity) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = activity.id;

    const tdName = document.createElement("td");
    tdName.textContent = activity.name;

    const tdCategory = document.createElement("td");
    tdCategory.textContent = activity.category;

    const tdDifficulty = document.createElement("td");
    tdDifficulty.textContent = activity.difficulty;

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdCategory);
    tr.appendChild(tdDifficulty);

    tbody.appendChild(tr);
  });
});
