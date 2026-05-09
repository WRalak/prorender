// Utility functions shared between client and server

// Date utilities
export const dateUtils = {
  formatDate: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  },

  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  },

  isYesterday: (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = new Date(date);
    return yesterday.toDateString() === checkDate.toDateString();
  },

  getRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return dateUtils.formatDate(date, 'MMM DD, YYYY');
  },

  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addMonths: (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  getDaysBetween: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};

// String utilities
export const stringUtils = {
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  titleCase: (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  slugify: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate: (str, length, suffix = '...') => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  stripHtml: (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  escapeHtml: (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  generateRandom: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Number utilities
export const numberUtils = {
  formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatNumber: (number, locale = 'en-US') => {
    return new Intl.NumberFormat(locale).format(number);
  },

  formatPercentage: (number, decimals = 1) => {
    return `${(number * 100).toFixed(decimals)}%`;
  },

  clamp: (number, min, max) => {
    return Math.min(Math.max(number, min), max);
  },

  roundToNearest: (number, nearest) => {
    return Math.round(number / nearest) * nearest;
  },

  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Array utilities
export const arrayUtils = {
  unique: (array) => [...new Set(array)],

  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  sortBy: (array, key, order = 'asc') => {
    return array.sort((a, b) => {
      if (order === 'desc') {
        return b[key] > a[key] ? 1 : -1;
      }
      return a[key] > b[key] ? 1 : -1;
    });
  },

  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  flatten: (array) => {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? arrayUtils.flatten(item) : item);
    }, []);
  },

  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  removeDuplicates: (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
};

// Object utilities
export const objectUtils = {
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = objectUtils.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  deepMerge: (target, source) => {
    const result = { ...target };
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = objectUtils.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  },

  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  hasKey: (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj) !== null;
  }
};

// File utilities
export const fileUtils = {
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  isImageFile: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(fileUtils.getFileExtension(filename));
  },

  isDocumentFile: (filename) => {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    return docExtensions.includes(fileUtils.getFileExtension(filename));
  },

  generateFileName: (originalName, prefix = '') => {
    const timestamp = Date.now();
    const extension = fileUtils.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const slugName = stringUtils.slugify(nameWithoutExt);
    return `${prefix}${slugName}_${timestamp}.${extension}`;
  }
};

// URL utilities
export const urlUtils = {
  buildQueryString: (params) => {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return query ? `?${query}` : '';
  },

  parseQueryString: (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  isValidUrl: (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  getDomainFromUrl: (url) => {
    try {
      return new URL(url).hostname;
    } catch (_) {
      return null;
    }
  }
};

// Color utilities
export const colorUtils = {
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  getContrastColor: (hexColor) => {
    const rgb = colorUtils.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },

  generateRandomColor: () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
};

// Validation utilities
export const validationUtils = {
  isEmpty: (value) => {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  },

  isEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isPhone: (phone) => {
    const re = /^\+?[\d\s\-\(\)]+$/;
    return re.test(phone);
  },

  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  },

  isNumber: (value) => {
    return !isNaN(value) && isFinite(value);
  },

  isInteger: (value) => {
    return Number.isInteger(Number(value));
  },

  isPositiveNumber: (value) => {
    return validationUtils.isNumber(value) && Number(value) > 0;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  },

  range: (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }
};
