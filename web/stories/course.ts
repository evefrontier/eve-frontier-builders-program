import type { CourseOutline } from "@/lib/curriculum";

/** A course for stories: four modules, nine lessons. */
export const course: CourseOutline = {
  slug: "world-interaction",
  title: "Frontier Systems & World Interaction",
  description: "Reading the world's state through the indexer and the World API.",
  modules: [
    {
      slug: "before-you-query",
      title: "Before you query",
      lessons: [
        { slug: "what-an-indexer-is-for", title: "What an indexer is for", duration: "6 min" },
        { slug: "the-shape-of-world-state", title: "The shape of world state", duration: "7 min" },
        { slug: "your-first-request", title: "Your first request", duration: "5 min" },
      ],
    },
    {
      slug: "graphql-against-the-frontier",
      title: "GraphQL against the Frontier",
      lessons: [
        { slug: "asking-for-fields", title: "Asking for fields", duration: "9 min" },
        { slug: "filtering-and-paging", title: "Filtering and paging", duration: "8 min" },
        { slug: "reading-a-smart-assembly", title: "Reading a Smart Assembly", duration: "9 min" },
      ],
    },
    {
      slug: "smart-assemblies-in-the-world",
      title: "Smart Assemblies in the world",
      lessons: [
        { slug: "gates-storage-and-turrets", title: "Gates, storage and turrets", duration: "11 min" },
        { slug: "fuel-decay-and-who-owns-what", title: "Fuel, decay and who owns what" },
      ],
    },
    {
      slug: "constraints-every-builder-works-inside",
      title: "Constraints every builder works inside",
      lessons: [{ slug: "what-the-world-api-will-not-do", title: "What the World API will not do", duration: "14 min" }],
    },
  ],
};
