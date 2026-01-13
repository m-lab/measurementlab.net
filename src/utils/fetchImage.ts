import type { ImageMetadata } from 'astro';

const fetchImage = (imagePath: string) => {
  if (!imagePath) return;
  const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/assets/**/*.{jpeg,jpg,png,gif,svg}'
  );

  // console.log('fetching image for path:', imagePath);
  // console.log('available images:', Object.keys(images));

  if (!images[imagePath]) {
    throw new Error(
      `"${imagePath}" does not exist in glob: "src/assets/*.{jpeg,jpg,png,gif,svg}"`
    );
  } else {
    return images[imagePath]();
  }
}

export default fetchImage;