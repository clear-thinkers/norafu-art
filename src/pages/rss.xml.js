import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const entries = await getCollection('artworks');
  const artworks = entries
    .map((e) => ({ id: e.id, ...e.data }))
    .sort((a, b) => parseInt(b.date) - parseInt(a.date));

  return rss({
    title: "Nora Fu's Art | 瓜瓜的画",
    description: 'Art by Nora Fu — marker and watercolor works from 2020 onwards.',
    site: context.site,
    items: artworks.map((artwork) => ({
      title: `${artwork.title.eng} | ${artwork.title.ch}`,
      description: `${artwork.description.eng} | ${artwork.description.ch}`,
      pubDate: new Date(
        parseInt(artwork.date.slice(0, 4)),
        parseInt(artwork.date.slice(4, 6)) - 1,
        parseInt(artwork.date.slice(6, 8)),
      ),
      link: `/artwork/${artwork.id}/`,
    })),
  });
}
