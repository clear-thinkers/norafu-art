import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ArtGallery from './components/ArtGallery';
import ArtDetail from './components/ArtDetail';
import About from './components/About';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('gallery');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [galleryScrollPosition, setGalleryScrollPosition] = useState(0);

  // Store filter in the parent so both Navbar and ArtGallery can see it
  const [filter, setFilter] = useState({
    year: null,
    tags: []
  });

  const navigateTo = (view, artwork = null) => {
    // Before changing view, capture the current scroll position if moving away from gallery
    if (currentView === 'gallery') {
      setGalleryScrollPosition(window.scrollY);
    }

    setCurrentView(view);
    setSelectedArtwork(artwork);
  };

  // Effect to restore scroll position when returning to gallery
  useEffect(() => {
    if (currentView === 'gallery') {
      window.scrollTo(0, galleryScrollPosition);
    }
  }, [currentView, galleryScrollPosition]);

  // This function updates the filter's year in state and navigates to 'gallery'
  const handleYearFilter = (year) => {
    setFilter({ ...filter, year });  // update only the year
    setCurrentView('gallery');       // switch view to gallery so user sees results
  };

  return (
    <div className="app">
      {/* Pass the handler to Navbar */}
      <Navbar
        navigateTo={navigateTo}
        currentView={currentView}
        handleYearFilter={handleYearFilter}
      />

      {currentView === 'gallery' && (
        <ArtGallery
          navigateTo={navigateTo}
          filter={filter}          // pass the current filter to the gallery
          setFilter={setFilter}    // optionally pass setFilter if you want to update tags, etc.
        />
      )}

      {currentView === 'detail' && selectedArtwork && (
        <ArtDetail
          artwork={selectedArtwork}
          navigateTo={navigateTo}
        />
      )}

      {currentView === 'about' && <About navigateTo={navigateTo} />}
    </div>
  );
}

export default App;