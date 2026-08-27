const DATA_URL = "./data/covers.json";
const archive = document.getElementById("cover-archive");

fetch(DATA_URL, { cache: "no-store" })
  .then(response => {
    if (!response.ok) {
      throw new Error("Could not load covers.json");
    }
    return response.json();
  })
  .then(data => {
    const issues = Array.isArray(data.issues) ? data.issues : [];
    renderArchive(issues);
  })
  .catch(error => {
    console.error("Cover archive loading error:", error);
    archive.innerHTML = "<p>Could not load cover archive.</p>";
  });


function renderArchive(issues) {
  const sorted = [...issues].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    if (yearDiff !== 0) return yearDiff;

    const monthDiff = Number(b.monthNumber) - Number(a.monthNumber);
    if (monthDiff !== 0) return monthDiff;

    /* Within each month: V1 first, then V2 */
    return issueRank(a.issue) - issueRank(b.issue);
  });

  const grouped = {};

  sorted.forEach(issue => {
    const year = String(issue.year);
    const monthKey = String(issue.monthNumber).padStart(2, "0");

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][monthKey]) grouped[year][monthKey] = [];

    grouped[year][monthKey].push(issue);
  });


  Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .forEach(year => {

      const yearSection = document.createElement("section");
      yearSection.className = "cover-year";

      const yearHeading = document.createElement("h2");
      yearHeading.className = "cover-year-heading";
      yearHeading.textContent = year;

      yearSection.appendChild(yearHeading);

      Object.keys(grouped[year])
        .sort((a, b) => Number(b) - Number(a))
        .forEach(monthKey => {

          const monthIssues = grouped[year][monthKey];
          const monthName = monthIssues[0].month;

          const monthSection = document.createElement("section");
          monthSection.className = "cover-month";

          const monthHeading = document.createElement("h3");
          monthHeading.className = "cover-month-heading";
          monthHeading.textContent = monthName;

          const issuesGrid = document.createElement("div");
          issuesGrid.className = "cover-issues";

          monthIssues.forEach(issue => {
            issuesGrid.appendChild(createIssue(issue));
          });

          monthSection.appendChild(monthHeading);
          monthSection.appendChild(issuesGrid);

          yearSection.appendChild(monthSection);
        });

      archive.appendChild(yearSection);
    });
}


function createIssue(issue) {
  const article = document.createElement("article");
  article.className = "cover-issue";

  const folder = normalizeFolder(issue.folder || "");
  const coverImage = issue.coverImage || (folder ? `${folder}/cover.jpg` : "");
  const imageLink = issue.link || coverImage || "#";

  const link = document.createElement("a");
  link.className = "cover-image-link";
  link.href = imageLink;

  const frame = document.createElement("div");
  frame.className = "cover-image-frame";

  const image = document.createElement("img");
  image.className = "cover-image";
  image.src = coverImage;
  image.alt = issue.alt || issue.title || "";
  image.loading = "lazy";

  const info = document.createElement("div");
  info.className = "cover-info";

  const title = document.createElement("h4");
  title.className = "cover-title";
  title.textContent = issue.title || "";

  const meta = document.createElement("div");
  meta.className = "cover-meta";
  meta.textContent = `${issue.month || ""} · ${issue.issue || ""}`;

  frame.appendChild(image);
  info.appendChild(title);
  info.appendChild(meta);

  link.appendChild(frame);
  link.appendChild(info);
  article.appendChild(link);

  return article;
}


function issueRank(issue) {
  const match = String(issue || "").match(/V(\d+)/i);
  return match ? Number(match[1]) : 0;
}


function normalizeFolder(folder) {
  return String(folder || "").replace(/\/+$/, "");
}
