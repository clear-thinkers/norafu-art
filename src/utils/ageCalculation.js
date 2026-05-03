const BIRTH_YEAR = 2018;

export const calculateNoraAge = (year) => {
  const age = year - BIRTH_YEAR;
  return age < 0 ? null : age;
};

export const formatAgeDescription = (age) => {
  if (age === null) return '';
  if (age === 0) return 'created in her birth year';
  const label = age === 1 ? 'year' : 'years';
  return `created at ${age} ${label} old`;
};
