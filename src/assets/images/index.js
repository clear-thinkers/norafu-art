// Eagerly import all artwork images so Astro can optimize them at build time.
// Keys are like './20250327_02.JPEG' — match artwork.imageSrc values.
export const artworkImages = import.meta.glob(
  './*.{jpeg,jpg,JPEG,JPG,png,PNG}',
  { eager: true }
);
