export const required = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'This field is required';
  }
  return true;
};

export const isEmail = (value) => {
  if (!value) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) || 'Invalid email address';
};

export const isPhone = (value) => {
  if (!value) return true;
  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
  return phoneRegex.test(value) || 'Invalid phone number';
};

export const isPositiveNumber = (value) => {
  if (!value && value !== 0) return true;
  return (parseFloat(value) > 0) || 'Must be a positive number';
};

export const minLength = (min) => (value) => {
  if (!value) return true;
  return value.length >= min || `Minimum ${min} characters required`;
};
