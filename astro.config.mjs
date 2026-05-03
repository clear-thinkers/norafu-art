import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://clear-thinkers.github.io',
  base: '/norafu-art/',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
