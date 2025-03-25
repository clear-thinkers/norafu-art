import React from 'react';
import { artworkData, filterArtworks } from '../data/artworkData';
import './ArtGallery.css';

const ArtGallery = ({ navigateTo, filter = {} }) => {
  // Use the filter from props (default to empty object if not provided)
  const filteredArtworks = filterArtworks(
    artworkData,
    filter.year,
    filter.tags || []
  );

// Sort artworks by year in descending order (most recent first)
const sortedArtworks = filteredArtworks.sort((a, b) => b.year - a.year);

  return (
    <div className="gallery-container">
      {/* Artwork Grid */}
      <div className="gallery-grid">
        {filteredArtworks.map((artwork) => (
          <div
            key={artwork.id}
            className="gallery-item"
            onClick={() => navigateTo('detail', artwork)}
          >
            <img
              src={artwork.imageSrc}
              alt={artwork.title}
            />
            <div>
              <h3>{artwork.title}</h3>
              <p>{artwork.year}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No Artwork Found Message */}
      {filteredArtworks.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888' }}>
          No artworks found matching the current filter.
        </div>
      )}
    </div>
  );
};

export default ArtGallery;