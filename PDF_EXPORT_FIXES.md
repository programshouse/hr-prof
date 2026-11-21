# Employee Profile PDF export fixes

- Arabic PDF text now uses the embedded **Amiri** font instead of DejaVu.
- Arabic is left to jsPDF's Arabic pre-processing hook (no double shaping).
- Employee photo is rendered as a square in the top-right, matching the supplied CV reference.
- PDF export reads the actual avatar currently rendered on the employee profile.
- Image URL handling now tries absolute, Laravel `/hr`, `/storage`, and `public/storage` URL variants.
- `image_url`, `image_path`, nested image objects, and raw employee API image fields are supported.
- If a remote image host blocks browser canvas/fetch through CORS, the PDF now renders a local initials avatar instead of leaving the image area blank.
