const STORAGE_KEYS = {
  BEEF_TARGETS: 'nutrition_beef_targets',
  DAIRY_TARGETS: 'nutrition_dairy_targets',
  POULTRY_TARGETS: 'nutrition_poultry_targets',
  BEEF_FEEDS: 'nutrition_beef_feeds',
  DAIRY_FEEDS: 'nutrition_dairy_feeds',
  POULTRY_FEEDS: 'nutrition_poultry_feeds',
  BEEF_RATIONS: 'nutrition_beef_rations',
  DAIRY_RATIONS: 'nutrition_dairy_rations',
  POULTRY_RATIONS: 'nutrition_poultry_rations',
};

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage', error);
      return false;
    }
  }
};

export const getStorageKeys = () => STORAGE_KEYS;

export const getTargetsKey = (animalType) => {
  switch (animalType) {
    case 'beef': return STORAGE_KEYS.BEEF_TARGETS;
    case 'dairy': return STORAGE_KEYS.DAIRY_TARGETS;
    case 'poultry': return STORAGE_KEYS.POULTRY_TARGETS;
    default: return STORAGE_KEYS.BEEF_TARGETS;
  }
};

export const getFeedsKey = (animalType) => {
  switch (animalType) {
    case 'beef': return STORAGE_KEYS.BEEF_FEEDS;
    case 'dairy': return STORAGE_KEYS.DAIRY_FEEDS;
    case 'poultry': return STORAGE_KEYS.POULTRY_FEEDS;
    default: return STORAGE_KEYS.BEEF_FEEDS;
  }
};

export const getRationsKey = (animalType) => {
  switch (animalType) {
    case 'beef': return STORAGE_KEYS.BEEF_RATIONS;
    case 'dairy': return STORAGE_KEYS.DAIRY_RATIONS;
    case 'poultry': return STORAGE_KEYS.POULTRY_RATIONS;
    default: return STORAGE_KEYS.BEEF_RATIONS;
  }
};

export default storage;
