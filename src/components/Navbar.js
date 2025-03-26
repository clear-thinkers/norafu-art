import React from 'react';
import { artworkData } from '../data/artworkData';
import './Navbar.css';

const Navbar = ({ navigateTo, currentView, handleYearFilter }) => {
  // Get unique years from artwork
  const years = [...new Set(artworkData.map(artwork => artwork.year))].sort();

  return (
    <nav className="navbar">
      <div 
        className="navbar-brand"
        onClick={() => navigateTo('gallery')}
      >
        <span style={{ fontSize: '2rem' }}>Nora Fu's Art</span> <br />
        <span style={{ fontSize: '1.5rem' }}>瓜 瓜 的 画</span>
      </div>

      <div className="navbar-menu">
        {/* Navigation Buttons */}
        <button 
          onClick={() => navigateTo('gallery')}
          className={currentView === 'gallery' ? 'active' : ''}
        >
          Gallery
        </button>

        {/* Year Filter Buttons */}
        <div className="year-filter">
          <button 
            onClick={() => handleYearFilter(null)}
            className={currentView === 'gallery' ? 'active' : ''}
          >
            All Years
          </button>
          {years.map(year => (
            <button 
              key={year} 
              onClick={() => handleYearFilter(year)}
              className={currentView === 'gallery' ? 'active' : ''}
            >
              {year}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigateTo('about')}
          className={currentView === 'about' ? 'active' : ''}
        >
          About
        </button>
      </div>
    </nav>
  );
};

export default Navbar;