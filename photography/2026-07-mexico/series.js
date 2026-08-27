const DATA_URL = "./series.json";
const gallery = document.getElementById("series-gallery");
const title = document.getElementById("series-title");
const meta = document.getElementById("series-meta");

fetch(DATA_URL, { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("Could not load series.json");
    return response.json();
  })
  .then(data => {
    title.textContent = data.title || "";
    document.title = `${data.title || "Photography"} — A Tiny Fragment of the World`;

    const metaParts = [
      data.displayDate || data.date || "",
      Array.isArray(data.images) ? `${data.images.length} photographs` : ""
    ].filter(Boolean);

    meta.textContent = metaParts.join(" · ");

    (data.images || []).forEach(image => {
      const figure = document.createElement("figure");

      const layout = image.layout || "wide";
      const align = image.align || "center";

      figure.className = `photo-item ${layout} ${align}`;

      const img = document.createElement("img");
      img.src = image.file;
      img.alt = image.alt || "";
      img.loading = "lazy";

      figure.appendChild(img);
      gallery.appendChild(figure);
    });
  })
  .catch(error => {
    console.error("Photography series loading error:", error);
    gallery.innerHTML = "<p>Could not load photography series.</p>";
  });
