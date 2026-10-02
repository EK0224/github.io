# National Parks map

This independent page contains 63 parks and the 21 first-visit months supplied in your Numbers file. Blank visit cells are treated as not yet visited. No future trips, exact dates, photos, or travel notes are included.

Extract the ZIP, keep the folder structure intact, and open `index.html` in a current browser while connected to the internet. The MapLibre library and public vector basemap load externally; no API key is required. The directory remains available if the external map cannot load.

For GitHub Pages, copy this folder into your existing repository, for example as `/national-parks/`, and link to `national-parks/index.html` from your navigation. This package does not modify or publish your existing website.

## Updating visit records

Edit `parks-data.js`. Each park has a `visited` boolean and `firstVisit` value in `YYYY-MM` format (or `null`). Change both fields together. `parks.json` is a readable copy of the initial data; the page reads `parks-data.js`. All data in these files is public when uploaded.

Only the optimized color WebP images are included. CSS applies grayscale and 1.2 brightness to not-yet-visited icons. Images preserve transparency. The original full-resolution art stays separate.

## Interaction

- Drag to move; scroll or use plus/minus to zoom. Right-drag tilts and rotates the camera.
- The default is a curved globe perspective. Zooming out morphs into a flat map. The Flat view button also switches manually.
- Nearby icons are displaced on screen and linked to their geographic anchors by fine lines. At high zoom they spread out naturally.
- Selecting a park opens an animated detail card: a larger circular landscape icon on the left and a rectangular panel on the right, with a short English description, state or territory, first-visit month when recorded, and three highlights. No day is invented for month-only records. Unvisited icons stay gray; their date row is hidden. On small screens the card stacks vertically. The native dialog supports Escape, a close button, outside clicks, and reduced-motion preferences. Larger 640px WebP images load only when selected. Search and region buttons provide access to every park, including Alaska, Hawaiʻi, American Samoa, and the Virgin Islands.
- Escape closes the directory and popup.

Coordinates are approximate representative park anchors for this illustrated atlas, not park boundaries or navigation points. The basemap shows generalized countries and coasts, plus fine state boundaries and selected major city locations. City labels appear progressively with zoom and yield to park badges. State boundaries load from the U.S. Census Bureau TIGERweb service; an unavailable boundary service does not stop the rest of the map. City coordinates are representative centers, not navigation points. Park badges now use two concentric white circular backgrounds, with a fine separator and soft shadow; only the landscape image is grayed for unvisited parks.

## Dependencies and verification

MapLibre GL JS 6.11.2: https://maplibre.org/maplibre-gl-js/docs/

Projection expressions: https://maplibre.org/maplibre-style-spec/projection/

Natural Earth / MapLibre demo vector tiles: https://github.com/maplibre/demotiles

The development environment cannot connect to the external map CDN or tile server. Data and local image assets passed validation; JavaScript syntax passed checks. A browser executable is unavailable in the development environment, so interactive behavior, globe rendering, and tile loading still require a connected browser check before publishing.

State boundaries (2026): https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0

Brief park descriptions and highlights are editorial summaries of the park design themes and landscape features. The detail panel links to each park’s official NPS page. Edit `park-details.js` to update descriptions.
