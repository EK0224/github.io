TRAVEL ARTICLE FOLDER NAMING

Use this format for every article folder:

YYYY-MM-DD-Vn

Examples:
2025-02-17-V1
2025-02-17-V2
2026-07-18-V1

Recommended structure:

travel/
├── 2025-02-17-V1/
│   ├── index.html
│   ├── cover.jpg
│   ├── 01.jpg
│   ├── 02.jpg
│   └── 03.jpg
├── 2025-02-17-V2/
└── 2026-07-18-V1/

The Travel landing page loads ONLY cover.jpg.

In data/travel.json:

{
  "date": "2025-02-17",
  "displayDate": "February 2025",
  "title": "Article title",
  "location": "Mexico City",
  "country": "Mexico",
  "folder": "travel/2025-02-17-V1",
  "coverPosition": "center 50%",
  "lat": 19.4326,
  "lng": -99.1332
}

The visible ordering is controlled by "date".
The folder name is for backend organization.

If multiple entries share a date, use:
2025-02-17-V1
2025-02-17-V2
2025-02-17-V3

coverPosition examples:
"center 50%"
"center 30%"
"center 70%"
"left center"
"right center"
