const DATA_URL = "./data/essays.json";
const archive = document.getElementById("essays-archive");

fetch(DATA_URL, { cache: "no-store" })
  .then(response => {
    if (!response.ok) {
      throw new Error("Could not load essays.json");
    }
    return response.json();
  })
  .then(data => {
    const essays = Array.isArray(data.essays) ? data.essays : [];
    renderArchive(essays);
  })
  .catch(error => {
    console.error("Essays archive loading error:", error);
    archive.innerHTML = "<p>Could not load essays archive.</p>";
  });

function renderArchive(essays) {
  const sorted = [...essays].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  const grouped = {};

  sorted.forEach(essay => {
    const year = String(essay.date).slice(0, 4);
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(essay);
  });

  Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(year => {
      const yearSection = document.createElement("section");
      yearSection.className = "essay-year";

      const yearHeading = document.createElement("h2");
      yearHeading.className = "essay-year-heading";
      yearHeading.textContent = year;

      const list = document.createElement("div");
      list.className = "essay-list";

      grouped[year].forEach(essay => {
        list.appendChild(createEssayEntry(essay));
      });

      yearSection.appendChild(yearHeading);
      yearSection.appendChild(list);
      archive.appendChild(yearSection);
    });
}

function createEssayEntry(essay) {
  const article = document.createElement("article");
  article.className = "essay-entry";

  const folder = normalizeFolder(essay.folder || "");
  const url = essay.url || (folder ? `${folder}/` : "#");

  const link = document.createElement("a");
  link.className = "essay-link";
  link.href = url;

  const title = document.createElement("h3");
  title.className = "essay-title";
  title.textContent = essay.title || "";

  const meta = document.createElement("div");
  meta.className = "essay-meta";

  const parts = [
    essay.displayDate || essay.date || "",
    essay.type || ""
  ].filter(Boolean);

  meta.textContent = parts.join(" · ");

  link.appendChild(title);
  link.appendChild(meta);
  article.appendChild(link);

  return article;
}

function normalizeFolder(folder) {
  return String(folder || "").replace(/\/+$/, "");
}
