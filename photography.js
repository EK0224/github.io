const DATA_URL = "./data/photography.json";
const archive = document.getElementById("photography-archive");

fetch(DATA_URL, { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Could not load photography.json");
    return response.json();
  })
  .then(data => {
    const series = Array.isArray(data.series) ? data.series : [];
    renderArchive(series);
  })
  .catch(error => {
    console.error("Photography archive loading error:", error);
    archive.innerHTML = "<p>Could not load photography archive.</p>";
  });

function renderArchive(series) {
  const sorted = [...series].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  const grouped = {};

  sorted.forEach(item => {
    const year = String(item.date).slice(0, 4);
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(item);
  });

  Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(year => {
      const section = document.createElement("section");
      section.className = "photo-year";

      const heading = document.createElement("h2");
      heading.className = "photo-year-heading";
      heading.textContent = year;

      const list = document.createElement("div");
      list.className = "photo-series-list";

      grouped[year].forEach(item => list.appendChild(createSeries(item)));

      section.appendChild(heading);
      section.appendChild(list);
      archive.appendChild(section);
    });
}

function createSeries(item) {
  const article = document.createElement("article");
  article.className = "photo-series";

  const folder = normalizeFolder(item.folder || "");
  const url = item.url || (folder ? `${folder}/` : "#");

  const link = document.createElement("a");
  link.className = "photo-series-link";
  link.href = url;

  const preview = document.createElement("div");
  preview.className = "photo-preview";

  const img = document.createElement("img");
  img.src = item.preview || `${folder}/preview.jpg`;
  img.alt = item.alt || item.title || "";
  img.loading = "lazy";
  img.style.setProperty("--preview-position", item.previewPosition || "center");

  preview.appendChild(img);

  const title = document.createElement("h3");
  title.className = "photo-series-title";
  title.textContent = item.title || "";

  const meta = document.createElement("div");
  meta.className = "photo-series-meta";

  const parts = [
    item.displayDate || item.date || "",
    item.count ? `${item.count} photographs` : ""
  ].filter(Boolean);

  meta.textContent = parts.join(" · ");

  /* image first, then title + metadata */
  link.appendChild(preview);
  link.appendChild(title);
  link.appendChild(meta);

  article.appendChild(link);
  return article;
}

function normalizeFolder(folder) {
  return String(folder || "").replace(/\/+$/, "");
}
