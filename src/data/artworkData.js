export const artworkData = [
    {
      id: 1,
      title: 'sweet things in life',
      year: 2025,
      medium: 'pencil & marker',
      description: "a stll life drawing of a cup of mac n cheese, nora's water bottle and her fav sweets.",
      imageSrc: `${process.env.PUBLIC_URL}/images/20250324.jpg`,
      tags: ['still life', 'marker']
    },
    {
      id: 2,
      title: 'the itsy bitsy spider',
      year: 2025,
      medium: 'pencil & marker',
      description: "an eight-legged spider busy spinning her web.",
      imageSrc: `${process.env.PUBLIC_URL}/images/20250315.jpg`,
      tags: ['animal', 'marker']
    },
    // Placeholder for more artworks
    // Add more artworks here to reach 40+ pieces
  ];
  
  export const filterArtworks = (artworks, year = null, tags = []) => {
    return artworks.filter(artwork => 
      (year === null || artwork.year === year) &&
      (tags.length === 0 || tags.some(tag => artwork.tags.includes(tag)))
    );
  };