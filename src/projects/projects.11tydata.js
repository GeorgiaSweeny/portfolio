// Every file in src/projects is a project page at /projects/<file name>/.
// Drafts (`draft: true`) are only built with `npm start` or `npm run build:drafts`.
const showDrafts = () => process.env.ELEVENTY_RUN_MODE === "serve" || process.env.SHOW_DRAFTS === "1";

export default {
  layout: "layouts/project.njk",
  section: "projects",
  eleventyComputed: {
    permalink: (data) => (data.draft && !showDrafts() ? false : `/projects/${data.page.fileSlug}/`),
    description: (data) => data.description || data.intro,
  },
};
