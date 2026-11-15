// Settings for the Nov 2026 site design. Everything here is site design, not
// content: a new site design replaces this file (see REDESIGN.md).
export default {
  url: "https://georgiasweeny.com",
  lang: "en-GB",
  // Cloudflare Turnstile site key (public; the secret key lives only in Cloudflare).
  turnstileSiteKey: "0x4AAAAAAF9-sNlu-FehDQ0N",
  // Cloudflare Web Analytics beacon token; empty = no analytics script.
  analyticsToken: "",
  // Where the CV PDF (content/cv.pdf) is published; the Download PDF buttons appear once it exists.
  cvPdfUrl: "/cv/georgia-sweeny-cv.pdf",
  // Personal Work stays hidden from visitors until this is true.
  showPersonalWork: false,

  // How each featured project's feature card is shown on Home, by project id.
  //   bleed: showcase clip fills the card (tone: light adds a darker wash for light clips)
  //   range: these images from the project's folder drift past like a shop display
  //   stage: showcase clip beside the words
  features: {
    "capturing-the-sun": { mode: "bleed", tone: "light" },
    "christmas-cards": { mode: "range", images: ["doorway.jpg", "museum.jpg", "choir.jpg", "moon.jpg", "postbox.jpg", "gold.jpg", "tree.jpg", "bench.jpg"] },
    pattinator: { mode: "stage" },
  },
  // Row height for galleries whose images read better smaller (default 450), by project id and gallery heading.
  galleryHeights: {
    "christmas-cards": { "The Range": 350 },
    pattinator: { "Patterns from One Shared Vocabulary": 350 },
    "the-old-oak-tree": { "Every Spread": 400, "The Artwork, Without Text": 400, "Early Sketches": 400 },
  },
  // YouTube videos shown as secondary clips (about half width, beside nothing).
  smallVideos: ["vNhvHVbImFI"],
};
