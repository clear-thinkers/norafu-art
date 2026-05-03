import { defineCollection, z } from 'astro:content';

const artworks = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.object({
      eng: z.string(),
      ch: z.string(),
    }),
    date: z.string(),
    year: z.number(),
    medium: z.string(),
    description: z.object({
      eng: z.string(),
      ch: z.string(),
    }),
    imageSrc: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { artworks };
