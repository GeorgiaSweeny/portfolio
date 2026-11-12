// Public CV. Built from the SGX CV plus details kept from the retired analyst CV.
// No email address, phone number or street address, ever.
// `project` links a CV project to its page on the site (file name in src/projects).
export default {
  sections: ["Skills", "Experience", "Projects", "Education", "Certifications", "Awards"],
  skills: [
    { group: "Design & Creative", text: "Illustration, layout and typography, print design and production, book layout and editing, storyboarding, Adobe Photoshop, Substance Painter, Houdini, generative design (p5.js)" },
    { group: "Motion & Video", text: "Adobe Premiere Pro (video and sound editing, compositing), 3D modelling and animation (Autodesk Maya, ZBrush, Unreal Engine), stop motion" },
    { group: "Brand & Stakeholder", text: "Interpreting briefs, client and stakeholder communication, pitching, supplier and stockist relationships, presenting work" },
    { group: "Planning & Tools", text: "Project coordination, Agile (Scrum), prioritisation, pricing and budgeting, user research, PowerPoint and Word, AI tools (Claude, ChatGPT), HTML/CSS, JavaScript/React" },
  ],
  experience: [
    { title: "Freelance Illustrator & Card Designer", years: "2018–2025", points: [
      "Designed, produced and sold a range of 8 original illustrated greeting cards and prints, handling artwork, print-ready files, print production, stock and pricing; grew annual profit from ~£500 to ~£2,000 at its peak.",
      "Pitched to the newly opened St Albans Museum + Gallery and became one of its first stocked local artists, with repeat orders for ~5 years; also stocked by St Albans Cathedral gift shop.",
      "Licensed designs to the Mayor of St Albans as the official Christmas card (2018) and to the Addison’s Disease Self-Help Group for fundraising cards (2021 and 2022); featured in the St Albans Artists’ Calendar.",
      "Ran my own marketing and sales through local social media groups, managing pre-orders, bulk orders and seasonal promotions."] },
    { title: "Showroom Assistant – Farrow & Ball", years: "2025", points: [
      "Advised customers on colour, finish and design choices for a premium, design-led heritage brand, translating their brief into tailored recommendations.",
      "Represented the brand’s standards and product expertise, explaining technical product information clearly."] },
    { title: "Social Media Content Creator – Atlas Translations", years: "2019", points: [
      "Created Instagram content promoting the company’s translation services, building brand visibility and engagement."] },
    { title: "Bar Staff – Nightclubs, Pubs and Festivals", years: "2021–2025", points: [
      "Developed resilience, teamwork, calm decision-making and a strong work ethic in fast-paced, customer-facing environments."] },
  ],
  projects: [
    { title: "Pattinator", project: "pattinator", sub: "MSc Dissertation", years: "2026", tools: "React, React Flow, JavaScript (SVG and Canvas rendering)", points: [
      "Designed and built a public web app that walks people through ten generative pattern algorithms step by step as an interactive node graph.",
      "Gathered requirements from 5 educators (primary school to workplace training) and prioritised scope with MoSCoW, tracing each feature back to user stories.",
      "Ran two pre/post user studies (25 participants, with a control group); average scores rose ~20% (6.8 to 8.2 out of 17) in the second study."] },
    { title: "The Abyss", project: "the-abyss", sub: "Collaborative Software Engineering Project", years: "2026", tools: "JavaScript, p5.js, GitHub", points: [
      "Product Owner and systems architect in a six-person Scrum team; structured the concept into 5 epics and 14 user stories.",
      "Designed all the game’s lighting (apart from the sonar), including the glowing jellyfish effect, and the level layouts.",
      "Designed the shared code architecture and wrote team guides so six developers could work in parallel."] },
    { title: "Islamic Pattern Generator Tool for Houdini", project: "islamic-pattern-generator", sub: "Procedural Graphics Research Project", years: "2024", tools: "Houdini, procedural / node-based design", points: [
      "Self-taught Houdini to build an artist-friendly tool that generates tileable Islamic geometric patterns from traditional rules (15+ designs), hiding the node network so artists with no Houdini experience can use it."] },
    { title: "The Picture of Dorian Gray", project: "the-picture-of-dorian-gray", sub: "Illustrated Edition", years: "2018–19", points: [
      "Formatted, edited, illustrated and hand-bound a hardback abridged edition as part of an A*-graded research project on engaging 9–11 year olds with classic literature."] },
    { title: "The Blot", project: "the-blot", sub: "3D Animated Short Film", years: "2022–23", points: [
      "Director, story creator, concept artist and character/environment modeller for a group short film, setting the creative direction for the team."] },
    { title: "Creature", project: "creature", sub: "DNEG 3D Modelling Masterclass", years: "2023–24", points: [
      "Took a creature from concept to production-ready asset against a studio brief, with mentorship from DNEG industry professionals."] },
    { title: "Infortunatus Mutatis", project: "infortunatus-mutatis", sub: "Stop-Motion Short Film", years: "2021", points: [
      "Full pipeline from set design and lighting to an edit in Premiere Pro; screened at The Odyssey Cinema."] },
  ],
  education: [
    { qual: "MSc Computer Science", place: "University of Bristol", years: "2025–2026", note: "Award pending" },
    { qual: "BA (Hons) Computer Animation: Art and Design", place: "Bournemouth University", years: "2021–2024", note: "2:1 · led a multidisciplinary team after my project pitch was selected" },
    { qual: "Art Foundation Diploma", place: "Arts University Bournemouth", years: "2020–2021", note: "Distinction" },
    { qual: "A Levels and GCSEs", place: "St Albans High School for Girls", years: "", note: "A Level Art (A*), English (B), Religious Studies (B); GCSE Mathematics (9)" },
  ],
  certifications: [
    "Python for Everybody – University of Michigan (Coursera, 2025)",
    "Programming with JavaScript – Meta (Coursera, 2025)",
    "Front-End Development – Meta (Coursera, 2024)",
  ],
  awards: [
    "Fundraising Award – Outlook Expeditions (2018): raised £4,000 through self-organised events and product sales for an overseas expedition and charitable work.",
    "St Albans Trophy Award winner – St Albans Art Society (2022)",
    "Academic Excellence Scholarship – Bournemouth University (2021)",
  ],
  interests: "Illustration, generative art, design, long-distance running and powerlifting.",
};
