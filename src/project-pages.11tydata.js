// Page data for each project page, from its project in content/.
export default {
  eleventyComputed: {
    title: (d) => d.project.title,
    description: (d) => d.project.description || d.project.intro,
    cardImage: (d) => d.project.cardImage,
    draft: (d) => Boolean(d.project.draft),
  },
};
