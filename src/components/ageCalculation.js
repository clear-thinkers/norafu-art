// Utility function to calculate Nora's age
export const calculateNoraAge = (year) => {
    const BIRTH_YEAR = 2018;
    
    // Calculate age
    const age = year - BIRTH_YEAR;
    
    // Handle edge cases
    if (age < 0) {
      return null; // For years before Nora was born
    }
    
    return age;
  };
  
  // Utility function to format age description
  export const formatAgeDescription = (age) => {
    if (age === null) return '';
    
    if (age === 0) {
      return 'created in her birth year';
    }
    
    const yearLabel = age === 1 ? 'year' : 'years';
    return `created at ${age} ${yearLabel} old`;
  };