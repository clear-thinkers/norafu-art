import React, { useState } from 'react';
import { artworkData } from '../data/artworkData';
import './Navbar.css';

const Navbar = ({ navigateTo, currentView, handleYearFilter }) => {
  // State to track the selected year
  const [selectedYear, setSelectedYear] = useState(null);

  // Get unique years from artwork, sorted from most recent to oldest
  const years = [...new Set(artworkData.map(artwork => artwork.year))].sort((a, b) => b - a);

  // Modified handleYearFilter to update selected year and view
  const onYearFilterClick = (year) => {
    setSelectedYear(year);
    handleYearFilter(year);
  };

  // Combined navigation and year filter reset
  const handleNavigation = (view) => {
    navigateTo(view);
    // Reset year filter when navigating to gallery
    if (view === 'gallery') {
      setSelectedYear(null);
      handleYearFilter(null);
    }
  };

  return (
    <nav className="navbar">
      <div 
        className="navbar-brand"
        onClick={() => handleNavigation('gallery')}
      >
        <span style={{ fontSize: '2rem' }}>Nora Fu's Art</span> <br />
        <span style={{ fontSize: '1.5rem' }}>瓜 瓜 的 画</span>
      </div>

      <div className="navbar-menu">
        {/* Navigation Buttons */}
        <button 
          onClick={() => handleNavigation('gallery')}
          className={currentView === 'gallery' ? 'active' : ''}
        >
          Gallery
        </button>

        {/* Year Filter Buttons */}
        <div className="year-filter">
          <button 
            onClick={() => onYearFilterClick(null)}
            className={selectedYear === null ? 'active' : ''}
          >
            All Years
          </button>
          {years.map(year => (
            <button 
              key={year} 
              onClick={() => onYearFilterClick(year)}
              className={selectedYear === year ? 'active' : ''}
            >
              {year}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleNavigation('about')}
          className={currentView === 'about' ? 'active' : ''}
        >
          About
        </button>
      </div>
    </nav>
  );
};

export default Navbar;