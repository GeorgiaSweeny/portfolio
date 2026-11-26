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
  showPersonalWork: true,

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
    "christmas-cards": { "The Doorway, Stage by Stage": 850 },
    "capturing-the-sun": { "Thumbnails": 300, "Storyboards": 300, "Building the Medina": 300, "Models and Textures": 300, "The Great Tree": 300 },
    pattinator: { "Patterns from One Shared Vocabulary": 350, "Development": 260 },
    "the-old-oak-tree": { "Every Spread": 400, "The Artwork, Without Text": 400, "Early Sketches": 400 },
    "the-abyss": { "Level Design": 300, "Development": 300 },
    "moroccan-lamp": { "Printing": 320, "Finishing and Assembly": 320 },
  },
  // Galleries shown as an even grid with this many images per row (fewer on phones), by project id and gallery heading.
  // For runs of same-shape images, such as stage-by-stage process photos, where every row should line up.
  galleryColumns: {
    "christmas-cards": { "The Range": 4, "Museum + Gallery, Stage by Stage": 3, "Carol of Bells, Stage by Stage": 6,
      "St Albans Postbox, Stage by Stage": 5, "Verulamium Lake, Stage by Stage": 6,
      "In the Works: Clock Tower": 5, "In the Works: Abbey Gateway": 5, "In the Works: St Peter’s Church": 4 },
  },
  // Opening media on a project page is its first full-size YouTube video, else its showcase clip,
  // else its card image. To choose differently for a project: { "<project id>": "video" | "clip" | "image" }.
  openings: {},
  // Project cards crop the card image to 4:3 from the centre. Where the subject sits off-centre,
  // set where the crop centres (CSS object-position, x then y).
  cardFocus: {
    "capturing-the-sun": "68% 50%",    // the Great Tree and the boy, right of centre
    "infortunatus-mutatis": "72% 50%", // the creature's face over the cauldron
  },
  // YouTube videos shown as secondary clips (about half width, beside nothing).
  smallVideos: ["vNhvHVbImFI"],
};
