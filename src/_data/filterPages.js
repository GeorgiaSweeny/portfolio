import disciplines from "./disciplineList.js";
import features from "./features.js";
import { loadContent } from "../_lib/content.js";
// "All" plus one shareable page per discipline: /projects/ and /projects/<slug>/.
// The Personal Work filter shows only while the Personal Work page is public and at least one
// project is filed under it (single artworks live on the Personal Work page itself).
export default () => {
  const hasPersonalProjects = loadContent().projects.some((p) => p.disciplines.includes("personal-work"));
  return [{ slug: "", label: "All" }, ...disciplines.filter((d) => d.slug !== "personal-work" || (features.personalWork && hasPersonalProjects))];
};
