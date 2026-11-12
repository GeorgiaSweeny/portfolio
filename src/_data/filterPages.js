import disciplines from "./disciplineList.js";
import features from "./features.js";
// "All" plus one shareable page per discipline: /projects/ and /projects/<slug>/.
// The Personal Work filter stays hidden while the Personal Work page is.
export default [{ slug: "", label: "All" }, ...disciplines.filter((d) => d.slug !== "personal-work" || features.personalWork)];
