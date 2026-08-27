const DATA_URL = "./data/travel.json";

const yearList = document.getElementById("year-list");
const travelList = document.getElementById("travel-list");

fetch(DATA_URL, { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Could not load travel.json");
    return response.json();
  })
  .then(data => {
    const articles = Array.isArray(data.articles) ? data.articles : [];
    const places = Array.isArray(data.places) ? data.places : [];
    buildTimeline(articles);
    buildMap(articles, places);
  })
  .catch(error => console.error("Travel page loading error:", error));

function buildTimeline(articles) {
  const sorted = [...articles].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const groups = {};

  sorted.forEach(article => {
    const year = String(article.date).slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(article);
  });

  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  if (!years.length) {
    travelList.innerHTML = "<p>No travel entries yet.</p>";
    return;
  }

  years.forEach((year, index) => {
    const button = document.createElement("button");
    button.className = "year-button" + (index === 0 ? " active" : "");
    button.type = "button";
    button.textContent = year;
    button.dataset.year = year;
    button.addEventListener("click", () => selectYear(year));
    yearList.appendChild(button);

    const group = document.createElement("section");
    group.className = "travel-year-group" + (index === 0 ? " active" : "");
    group.dataset.year = year;

    groups[year].forEach(article => group.appendChild(createTravelEntry(article)));
    travelList.appendChild(group);
  });
}

function selectYear(year) {
  document.querySelectorAll(".year-button").forEach(button => {
    button.classList.toggle("active", button.dataset.year === year);
  });

  document.querySelectorAll(".travel-year-group").forEach(group => {
    group.classList.toggle("active", group.dataset.year === year);
  });
}

function createTravelEntry(article) {
  const entry = document.createElement("article");
  entry.className = "travel-entry";

  const link = document.createElement("a");
  link.className = "travel-entry-link";
  link.href = article.url || "#";

  if (article.image) {
    const image = document.createElement("img");
    image.className = "travel-entry-image";
    image.src = article.image;
    image.alt = article.alt || article.title || "";
    image.loading = "lazy";
    link.appendChild(image);
  }

  const info = document.createElement("div");
  info.className = "travel-entry-info";

  const date = document.createElement("div");
  date.className = "travel-entry-date";
  date.textContent = article.displayDate || article.date || "";

  const title = document.createElement("h2");
  title.className = "travel-entry-title";
  title.textContent = article.title || "";

  const location = document.createElement("div");
  location.className = "travel-entry-location";
  location.textContent = [article.location, article.country].filter(Boolean).join(" · ");

  info.appendChild(date);
  info.appendChild(title);
  info.appendChild(location);
  link.appendChild(info);
  entry.appendChild(link);

  return entry;
}

function buildMap(articles, places) {
  if (typeof L === "undefined") return;

  const map = L.map("travel-map", {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([25, 10], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const allPlaces = [
    ...places.map(place => ({ ...place, source: "place" })),
    ...articles
      .filter(article => Number.isFinite(Number(article.lat)) && Number.isFinite(Number(article.lng)))
      .map(article => ({ ...article, source: "article" }))
  ];

  const seen = new Set();
  const bounds = [];

  allPlaces.forEach(place => {
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const key = `${lat.toFixed(4)},${lng.toFixed(4)},${place.title || place.name || ""}`;
    if (seen.has(key)) return;
    seen.add(key);

    const marker = L.circleMarker([lat, lng], {
      radius: 5,
      color: "#5f5a53",
      weight: 1,
      fillColor: "#5f5a53",
      fillOpacity: 0.72
    }).addTo(map);

    marker.bindPopup(createPopup(place));
    bounds.push([lat, lng]);
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 5);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: 5 });
  }
}

function createPopup(place) {
  const title = escapeHTML(place.title || place.name || place.location || "Place");
  const metaParts = [
    place.location && place.location !== place.name ? place.location : "",
    place.country,
    place.displayDate
  ].filter(Boolean);
  const meta = escapeHTML(metaParts.join(" · "));
  const link = place.url
    ? `<a class="map-popup-link" href="${escapeAttribute(place.url)}">Open article →</a>`
    : "";

  return `
    <div>
      <p class="map-popup-title">${title}</p>
      ${meta ? `<p class="map-popup-meta">${meta}</p>` : ""}
      ${link}
    </div>
  `;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}
