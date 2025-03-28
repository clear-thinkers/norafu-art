import React from 'react';
import { calculateNoraAge, formatAgeDescription } from './ageCalculation'; // Assuming the utility functions are in a separate file
import './ArtDetail.css';

const ArtDetail = ({ artwork, navigateTo }) => {
  // Calculate Nora's age for this artwork
  const noraAge = calculateNoraAge(artwork.year);
  const ageDescription = formatAgeDescription(noraAge);
  
  return (
    <div className="art-detail-container">
      {/* Artwork Image */}
      <div className="art-detail-image">
        <img src={artwork.imageSrc} alt={artwork.title} />
      </div>

      {/* Artwork Details */}
      <div className="art-detail-info">
        <h1>{artwork.title.eng} | {artwork.title.ch}</h1>
        <div>
          <p><strong>year:</strong> {artwork.year}</p>
          <p><strong>medium & age:</strong> {artwork.medium}
          {ageDescription && (
              <span className="nora-age-description"> ({ageDescription})</span>
            )}
          </p>
        </div>
        <p>{artwork.description.eng} | {artwork.description.ch}</p>
        
        {/* Tags (if any) */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="art-detail-tags">
            {artwork.tags.map(tag => (
              <span key={tag} className="art-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* MOVED BACK BUTTON HERE (AFTER TAGS) */}
        <button 
          className="back-button"
          onClick={() => navigateTo('gallery')}
        >
          ← Back to Gallery
        </button>
      </div>
    </div>
  );
};

export default ArtDetail;