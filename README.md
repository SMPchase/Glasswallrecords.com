# Glasswall Records

The public label site for [glasswallrecords.com](https://glasswallrecords.com/).

## Publishing

The site is plain HTML, CSS, and JavaScript and is published from the root of the `main` branch with GitHub Pages. The `CNAME` file must remain in place.

Public pages include a complete authored fallback, then load published label content from the protected Saint Jules publishing system at `https://room.saintjules.org/api/glasswall`. If that service is unavailable, the fallback artwork and Saint Jules feature remain visible.

The private owner dashboard is at [studio.saintjules.org/studio](https://studio.saintjules.org/studio). It manages label settings, artwork, artist profiles, the latest release’s title, artist, description, cover, preview audio, listening link and publication state, the release section’s visibility, heading and color, and the submissions inbox.

## Artwork

The public Saint Jules profile and release use only the supplied foil artwork, as requested:

- `saint-jules-foil-art.jpeg`

The foil derivative uses a deliberately low-fi print texture and is not stretched into a full-browser background because the source is small. Other artwork can be uploaded later through Studio.

## Submissions

The public form posts to the Glasswall API and stores submissions privately for review in Studio. `hello@glasswallrecords.com` remains visible as a fallback contact.
