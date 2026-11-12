export default {
  name: "Georgia Sweeny",
  url: "https://georgiasweeny.com",
  lang: "en-GB",
  // Status tag. Once in a job, change to e.g. "Now at …" and set open: false.
  status: { text: "Open to work · London area", open: true },
  positioning: "I craft beautiful things by hand and engineer the tools to make more of them.",
  roles: ["Designer", "Illustrator", "Technical Artist"],
  description: "Georgia Sweeny: designer, illustrator and technical artist. I craft beautiful things by hand and engineer the tools to make more of them.",
  social: {
    linkedin: "https://www.linkedin.com/in/georgia-sweeny",
    github: "https://github.com/GeorgiaSweeny",
    youtube: "https://www.youtube.com/@georgia-sweeny",
  },
  // Cloudflare Turnstile site key (public). Replace once the Cloudflare account exists;
  // this one is Cloudflare's always-passes test key.
  turnstileSiteKey: "1x00000000000000000000AA",
  // Cloudflare Web Analytics beacon token; empty = no analytics script.
  analyticsToken: "",
  // The PDF CV: put the file at src/static/cv/georgia-sweeny-cv.pdf and the
  // Download PDF buttons appear on the next build.
  cvPdf: "/cv/georgia-sweeny-cv.pdf",
  // Personal Work stays hidden from visitors until this is true.
  showPersonalWork: false,
};
