import React from 'react';

const ArtDetail = ({ artwork, navigateTo }) => {
  return (
    <div className="art-detail-container">
      {/* Back Button */}
      <button 
        className="back-button"
        onClick={() => navigateTo('gallery')}
      >
        ← Back to Gallery
      </button>

      {/* Artwork Image */}
      <div className="art-detail-image">
        <img 
          src={artwork.imageSrc} 
          alt={artwork.title} 
        />
      </div>

      {/* Artwork Details */}
      <div className="art-detail-info">
        <h1>{artwork.title}</h1>
        <div>
          <p><strong>Year:</strong> {artwork.year}</p>
          <p><strong>Medium:</strong> {artwork.medium}</p>
        </div>
        <p>{artwork.description}</p>
        
        {/* Tags (if any) */}
        {artwork.tags && artwork.tags.length > 0 && (
          <div className="art-detail-tags">
            {artwork.tags.map(tag => (
              <span 
                key={tag} 
                className="art-tag"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtDetail;