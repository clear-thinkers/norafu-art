import React, { useState, useEffect, useRef } from 'react';
import { artworkData, filterArtworks, getSortedArtworks } from '../data/artworkData';
import './ArtGallery.css';

const ArtGallery = ({ 
  navigateTo, 
  filter = {}, 
  scrollPosition = 0,
  onScrollPositionChange 
}) => {
  const galleryRef = useRef(null);

  // Use the new getSortedArtworks function
  const sortedArtworks = getSortedArtworks(artworkData);

  // Apply filters to the sorted artworks
  const filteredArtworks = filterArtworks(
    sortedArtworks,
    filter.year,
    filter.tags || [],
    {
      minPrice: filter.minPrice
    }
  );

  // Restore scroll position when component mounts or updates
  useEffect(() => {
    if (galleryRef.current && scrollPosition > 0) {
      galleryRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  // Track scroll position when scrolling
  const handleScroll = (e) => {
    if (onScrollPositionChange) {
      onScrollPositionChange(e.target.scrollTop);
    }
  };

  return (
    <div 
      ref={galleryRef}
      className="gallery-container"
      onScroll={handleScroll}
    >
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
              alt={artwork.title.eng}
              loading="lazy"
              onError={(e) => {
                console.error(`Error loading image for ${artwork.title.eng}`, e);
                e.target.src = '/path/to/fallback/image.jpg';
              }}
            />
            <div className="artwork-info">
              <h3>{artwork.title.eng} | {artwork.title.ch}</h3>
              <p>{artwork.date} | {artwork.medium} </p>
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