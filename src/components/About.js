import React from 'react';
import './About.css';

const About = ({ navigateTo }) => {
  return (
    <div className="about-container">
      <h1>About Nora Fu</h1>
      
      <img 
          src="/norafu-art/images/profile.JPG"
          alt="Artist Portrait"
          className="about-portrait"
      />
      
      <p>
      
Born in July 2018, Nora Fu’s love for art blossomed at an incredibly young age. 
By the time she was just 18 months old, Nora showed an extraordinary fascination with colors and drawings, captivating her family with her early artistic expressions. 
Whether it was crayons on paper or vibrant chalk on the sidewalk, it became clear that art was an innate part of who she is. <br />
<br />
As Nora grew, her artistic talents only flourished. From Pre-K through 1st grade, she was known as “the artist” of her class, consistently standing out for her creativity and eye for detail. 
She didn’t just participate in art; she lived and breathed it, bringing her unique perspective to every project she touched. <br />
<br />
At the age of four, Nora began taking formal art lessons at Y School of Arts, a journey that has continued to this day. 
Her early dedication has allowed her to explore various techniques and mediums, constantly refining her skills while embracing her love for creation. 
Each new piece she works on is a reflection of her boundless imagination, her playful yet thoughtful nature, and her joyful exploration of the world through art. <br />
      </p>
      
      
      <button 
        onClick={() => navigateTo('gallery')}
      >
        View Artwork
      </button>
    </div>
  );
};

export default About;