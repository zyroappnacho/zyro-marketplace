import { Alert, Linking, Platform } from 'react-native';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

// Validation helpers
export const validateEmail = (email) => {
  if (!email) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!VALIDATION_RULES.EMAIL.test(email)) return ERROR_MESSAGES.INVALID_EMAIL;
  return null;
};

export const validatePassword = (password) => {
  if (!password) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) return ERROR_MESSAGES.INVALID_PASSWORD;
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!VALIDATION_RULES.PHONE.test(phone)) return ERROR_MESSAGES.INVALID_PHONE;
  return null;
};

export const validateInstagram = (username) => {
  if (!username) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!VALIDATION_RULES.INSTAGRAM_USERNAME.test(username)) return ERROR_MESSAGES.INVALID_INSTAGRAM;
  return null;
};

export const validateCIF = (cif) => {
  if (!cif) return ERROR_MESSAGES.REQUIRED_FIELD;
  if (!VALIDATION_RULES.CIF.test(cif) && !VALIDATION_RULES.NIE.test(cif) && !VALIDATION_RULES.DNI.test(cif)) {
    return ERROR_MESSAGES.INVALID_CIF;
  }
  return null;
};

// Form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = ERROR_MESSAGES.REQUIRED_FIELD;
      isValid = false;
    } else if (value && rule.validator) {
      const error = rule.validator(value);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Date and time helpers
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `Hace ${years} año${years > 1 ? 's' : ''}`;
  if (months > 0) return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  if (weeks > 0) return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace unos segundos';
};

export const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

export const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

// Number formatting helpers
export const formatNumber = (number, decimals = 0) => {
  if (typeof number !== 'number') return '0';
  return number.toLocaleString('es-ES', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export const formatCurrency = (amount, currency = 'EUR') => {
  if (typeof amount !== 'number') return '0€';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatFollowers = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%';
  return `${value.toFixed(decimals)}%`;
};

// String helpers
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const slugify = (str) => {
  if (!str) return '';
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Array helpers
export const removeDuplicates = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  
  return [...new Set(array)];
};

export const sortByKey = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return array.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (direction === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

// Device and platform helpers
export const isIOS = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';

export const getDeviceType = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const aspectRatio = height / width;
  
  if (Platform.OS === 'ios') {
    if (width >= 768) return 'tablet';
    if (aspectRatio > 2) return 'iphoneX';
    return 'iphone';
  }
  
  if (width >= 768) return 'tablet';
  return 'android';
};

// External app helpers
export const openURL = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se puede abrir este enlace');
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('Error', 'No se pudo abrir el enlace');
  }
};

export const openEmail = (email, subject = '', body = '') => {
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  openURL(url);
};

export const openPhone = (phoneNumber) => {
  const url = `tel:${phoneNumber}`;
  openURL(url);
};

export const openMaps = (address) => {
  const encodedAddress = encodeURIComponent(address);
  const url = Platform.OS === 'ios' 
    ? `maps://app?q=${encodedAddress}`
    : `geo:0,0?q=${encodedAddress}`;
  openURL(url);
};

export const openInstagram = (username) => {
  const cleanUsername = username.replace('@', '');
  const url = `instagram://user?username=${cleanUsername}`;
  const fallbackUrl = `https://instagram.com/${cleanUsername}`;
  
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      openURL(fallbackUrl);
    }
  });
};

export const shareContent = async (content) => {
  try {
    const { Share } = require('react-native');
    await Share.share({
      message: content.message || content,
      url: content.url,
      title: content.title,
    });
  } catch (error) {
    console.error('Error sharing content:', error);
  }
};

// Storage helpers
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Error handling helpers
export const handleError = (error, showAlert = true) => {
  console.error('Error:', error);
  
  let message = ERROR_MESSAGES.NETWORK_ERROR;
  
  if (error.response) {
    // Server responded with error status
    message = error.response.data?.message || error.response.statusText || message;
  } else if (error.request) {
    // Request was made but no response received
    message = ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Something else happened
    message = error.message || message;
  }
  
  if (showAlert) {
    Alert.alert('Error', message);
  }
  
  return message;
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle helper
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};