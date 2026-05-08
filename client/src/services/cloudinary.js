class CloudinaryService {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo';
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';
    this.apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.REACT_APP_CLOUDINARY_API_SECRET || '';
  }

  // Upload image to Cloudinary
  async uploadImage(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    if (options.tags) {
      formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags);
    }
    if (options.resource_type) {
      formData.append('resource_type', options.resource_type);
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to upload image');
      }

      const result = await response.json();
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, options = {}) {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadImage(file, options)
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw error;
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = this.generateSignature({
      public_id: publicId,
      timestamp: timestamp,
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete image');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  // Generate signature for authenticated requests
  generateSignature(params) {
    // Note: In production, this should be done on the server side
    // This is a simplified version for demonstration
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // This would normally use crypto to create SHA-1 hash
    // For now, returning a placeholder
    return 'placeholder_signature';
  }

  // Get transformed image URL
  getTransformedUrl(publicId, transformations = {}) {
    const transformString = this.buildTransformString(transformations);
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    
    if (transformString) {
      return `${baseUrl}/${transformString}/${publicId}`;
    }
    
    return `${baseUrl}/${publicId}`;
  }

  // Build transformation string
  buildTransformString(transformations) {
    const transforms = [];

    if (transformations.width) {
      transforms.push(`w_${transformations.width}`);
    }
    if (transformations.height) {
      transforms.push(`h_${transformations.height}`);
    }
    if (transformations.crop) {
      transforms.push(`c_${transformations.crop}`);
    }
    if (transformations.quality) {
      transforms.push(`q_${transformations.quality}`);
    }
    if (transformations.format) {
      transforms.push(`f_${transformations.format}`);
    }
    if (transformations.gravity) {
      transforms.push(`g_${transformations.gravity}`);
    }
    if (transformations.radius) {
      transforms.push(`r_${transformations.radius}`);
    }
    if (transformations.opacity) {
      transforms.push(`o_${transformations.opacity}`);
    }
    if (transformations.brightness) {
      transforms.push(`e_brightness:${transformations.brightness}`);
    }
    if (transformations.contrast) {
      transforms.push(`e_contrast:${transformations.contrast}`);
    }
    if (transformations.saturation) {
      transforms.push(`e_saturation:${transformations.saturation}`);
    }

    return transforms.join(',');
  }

  // Get thumbnail URL
  getThumbnailUrl(publicId, width = 150, height = 150, crop = 'fill') {
    return this.getTransformedUrl(publicId, {
      width,
      height,
      crop,
      quality: 'auto',
    });
  }

  // Get responsive image URL
  getResponsiveUrl(publicId, maxWidth = 1200) {
    return this.getTransformedUrl(publicId, {
      width: maxWidth,
      crop: 'scale',
      quality: 'auto',
      format: 'auto',
    });
  }

  // Get optimized image URL
  getOptimizedUrl(publicId) {
    return this.getTransformedUrl(publicId, {
      quality: 'auto',
      format: 'auto',
      fetch_format: 'auto',
    });
  }

  // Validate image before upload
  validateImage(file, maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size ${file.size} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
    }

    return true;
  }

  // Compress image before upload (client-side)
  async compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get image info from URL
  async getImageInfo(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  // Generate placeholder image URL
  getPlaceholderUrl(width = 400, height = 300, text = 'Placeholder') {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${width},h_${height},c_fill,b_auto:contrast,o_30,f_auto/${encodeURIComponent(text)}.png`;
  }
}

export default new CloudinaryService();