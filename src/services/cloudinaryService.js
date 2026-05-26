import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'pocket_fm_audio';

const cloudinaryService = {
  // Upload audio file to Cloudinary
  uploadAudio: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video');
    formData.append('folder', 'pocket-fm/audio');
    formData.append('chunk_size', '6000000');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          }
        }
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        duration: response.data.duration || 0,
        format: response.data.format,
        size: response.data.bytes,
        bitRate: response.data.bit_rate,
        sampleRate: response.data.sample_rate
      };
    } catch (error) {
      console.error('Cloudinary audio upload error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to upload audio');
    }
  },

  // Upload image file to Cloudinary
  uploadImage: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'pocket-fm/thumbnails');
    formData.append('transformation', 'w_800,h_800,c_fill,q_auto:good');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          }
        }
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        format: response.data.format,
        width: response.data.width,
        height: response.data.height,
        size: response.data.bytes,
        thumbnailUrl: response.data.eager?.[0]?.secure_url || response.data.secure_url
      };
    } catch (error) {
      console.error('Cloudinary image upload error:', error);
      throw new Error(error.response?.data?.error?.message || 'Failed to upload image');
    }
  },

  // Get optimized image URL
  getImageUrl: (publicId, options = {}) => {
    const {
      width = 400,
      height = 400,
      crop = 'fill',
      quality = 'auto:good'
    } = options;

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
  },

  // Get audio streaming URL
  getAudioUrl: (publicId, options = {}) => {
    const { format = 'mp3', quality = 'auto' } = options;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_${quality}/${publicId}.${format}`;
  },

  // Get audio URL with specific bitrate
  getAudioStreamUrl: (publicId, bitrate = '128k') => {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/br_${bitrate}/${publicId}.mp3`;
  },

  // Delete file from Cloudinary
  deleteFile: async (publicId, resourceType = 'image') => {
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/destroy`,
        {
          public_id: publicId,
          resource_type: resourceType
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete file');
    }
  },

  // Generate thumbnail from video/audio
  generateThumbnail: (publicId, time = '00:00:02') => {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/so_${time}/${publicId}.jpg`;
  },

  // Get placeholder image
  getPlaceholder: (width = 400, height = 400, text = 'No Image') => {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_60/${text}`;
  }
};

export default cloudinaryService;