import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import seriesService from '../../services/seriesService';
import episodeService from '../../services/episodeService';
import {
  FiUpload, FiX, FiFile, FiCheck, FiAlertCircle,
  FiLoader, FiHeadphones, FiInfo, FiPlusCircle, FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './UploadEpisode.css';

const UploadEpisode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    series_id: '',
    title: '',
    description: '',
    episode_number: '',
    season_number: '1'
  });
  
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [seriesList, setSeriesList] = useState([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  // ----- CHAPTER STATE -----
  const [createdEpisodeId, setCreatedEpisodeId] = useState(null);
  const [showChapterEditor, setShowChapterEditor] = useState(false);
  const [chapters, setChapters] = useState([{ title: '', start_time_seconds: 0 }]);
  const [isSavingChapters, setIsSavingChapters] = useState(false);

  // Read query params for TTS pre‑fill
  useEffect(() => {
    const seriesIdFromUrl = searchParams.get('seriesId');
    const titleFromUrl = searchParams.get('title');
    const descriptionFromUrl = searchParams.get('description');

    setFormData(prev => ({
      ...prev,
      series_id: seriesIdFromUrl || prev.series_id,
      title: titleFromUrl || prev.title,
      description: descriptionFromUrl || prev.description,
    }));

    fetchMySeries();
  }, []);

  const fetchMySeries = async () => {
    setIsLoadingSeries(true);
    try {
      const response = await seriesService.getMySeries({ limit: 100 });
      const list = response?.data?.data?.series || response?.data?.series || response?.series || [];
      setSeriesList(list);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error('Failed to load series');
    } finally {
      setIsLoadingSeries(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.series_id) newErrors.series_id = 'Please select a series';
    if (!formData.title.trim()) newErrors.title = 'Episode title is required';
    if (!formData.episode_number || formData.episode_number < 1) newErrors.episode_number = 'Valid episode number is required';
    if (!audioFile) newErrors.audio = 'Audio file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, audio: 'Invalid file type. Please upload MP3, WAV, or OGG files.' }));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, audio: 'File size must be less than 500MB' }));
      return;
    }
    setAudioFile(file);
    setErrors(prev => ({ ...prev, audio: '' }));
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, thumbnail: 'Invalid image type.' }));
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, thumbnail: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const payload = new FormData();
      payload.append('audio', audioFile);
      payload.append('series_id', formData.series_id);
      payload.append('title', formData.title);
      payload.append('episode_number', formData.episode_number);
      payload.append('season_number', formData.season_number || '1');
      if (formData.description) payload.append('description', formData.description);
      if (thumbnailFile) payload.append('thumbnail', thumbnailFile);

      // Upload the episode using the service that supports progress
      const res = await episodeService.createEpisodeWithFile(payload, (percent) => {
        setUploadProgress(percent);
      });

      const episodeId = res.data?.data?.episode?.id || res.data?.episode?.id;
      toast.success('Episode uploaded successfully!');
      setCreatedEpisodeId(episodeId);
      setShowChapterEditor(true);   // optionally add chapters right after upload

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload episode');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ----- CHAPTER HANDLERS -----
  const addChapterRow = () => {
    setChapters(prev => [...prev, { title: '', start_time_seconds: 0 }]);
  };

  const removeChapterRow = (index) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const updateChapter = (index, field, value) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'start_time_seconds' ? Number(value) : value };
      return updated;
    });
  };

  const saveChapters = async () => {
    if (!createdEpisodeId) return;
    const validChapters = chapters.filter(ch => ch.title.trim() !== '');
    if (validChapters.length === 0) {
      toast('No chapters to save');
      return;
    }
    setIsSavingChapters(true);
    try {
      await episodeService.saveChapters(createdEpisodeId, { chapters: validChapters });
      toast.success('Chapters saved!');
      setShowChapterEditor(false);
      navigate('/creator/series');  // go back to series after finishing
    } catch (error) {
      toast.error('Failed to save chapters');
      console.error(error);
    } finally {
      setIsSavingChapters(false);
    }
  };

  const removeAudio = () => { setAudioFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const removeThumbnail = () => { setThumbnailFile(null); setThumbnailPreview(null); };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-episode">
      <motion.div className="upload-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="upload-header">
          <h1>Upload New Episode</h1>
          <p>Add a new episode to your series</p>
        </div>

        {!showChapterEditor ? (
          <form onSubmit={handleSubmit} className="upload-form">
            {/* Series Selection */}
            <div className={`form-group ${errors.series_id ? 'has-error' : ''}`}>
              <label>Select Series</label>
              <select name="series_id" value={formData.series_id} onChange={handleInputChange} className="form-select" disabled={isLoadingSeries}>
                <option value="">{isLoadingSeries ? 'Loading...' : 'Select a series'}</option>
                {seriesList.map(series => (<option key={series.id} value={series.id}>{series.title}</option>))}
              </select>
              {errors.series_id && <span className="error-text">{errors.series_id}</span>}
            </div>

            {/* Episode Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label>Episode Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter episode title" className="form-input" />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            {/* Episode & Season Number */}
            <div className="form-row">
              <div className={`form-group ${errors.episode_number ? 'has-error' : ''}`}>
                <label>Episode Number</label>
                <input type="number" name="episode_number" value={formData.episode_number} onChange={handleInputChange} placeholder="1" min="1" className="form-input" />
                {errors.episode_number && <span className="error-text">{errors.episode_number}</span>}
              </div>
              <div className="form-group">
                <label>Season Number</label>
                <input type="number" name="season_number" value={formData.season_number} onChange={handleInputChange} placeholder="1" min="1" className="form-input" />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} className="form-textarea" placeholder="Episode description (or full story text from TTS)" />
            </div>

            {/* Audio Upload */}
            <div className={`form-group ${errors.audio ? 'has-error' : ''}`}>
              <label>Audio File</label>
              {!audioFile ? (
                <div className="upload-area" onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleAudioSelect({ target: { files: [file] } }); }}>
                  <FiUpload size={32} />
                  <p className="upload-text"><span>Click to upload</span> or drag and drop</p>
                  <p className="upload-hint">MP3, WAV, OGG (Max 500MB)</p>
                </div>
              ) : (
                <div className="file-preview">
                  <div className="file-info">
                    <FiFile size={20} />
                    <div>
                      <p className="file-name">{audioFile.name}</p>
                      <p className="file-size">{formatFileSize(audioFile.size)}</p>
                    </div>
                  </div>
                  <button type="button" className="file-remove" onClick={removeAudio}><FiX /></button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-m4a" onChange={handleAudioSelect} style={{ display: 'none' }} />
              {errors.audio && <span className="error-text">{errors.audio}</span>}
            </div>

            {/* Thumbnail Upload */}
            <div className="form-group">
              <label>Thumbnail</label>
              {!thumbnailFile ? (
                <div className="thumbnail-upload" onClick={() => document.getElementById('thumbnail-input').click()}>
                  <FiHeadphones size={24} /> <span>Add thumbnail image</span>
                </div>
              ) : (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                  <button type="button" className="thumbnail-remove" onClick={removeThumbnail}><FiX /></button>
                </div>
              )}
              <input id="thumbnail-input" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleThumbnailSelect} style={{ display: 'none' }} />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div>
                <span className="progress-text"><FiLoader className="spinning" /> Uploading... {uploadProgress}%</span>
              </div>
            )}

            <div className="upload-info"><FiInfo /><p>Audio files are processed and optimized for streaming.</p></div>

            <motion.button type="submit" className="upload-btn" disabled={isUploading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isUploading ? <><FiLoader className="spinning" /> Uploading...</> : <><FiCheck /> Upload Episode</>}
            </motion.button>
          </form>
        ) : (
          /* ----- CHAPTER EDITOR (simplified) ----- */
          <div className="chapter-editor" style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginTop: 20 }}>
            <h3>Add Chapters (Optional)</h3>
            <p style={{ color: '#aaa', marginBottom: 16 }}>Define chapter marks for listeners to skip to.</p>
            {chapters.map((ch, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Chapter title"
                  value={ch.title}
                  onChange={(e) => updateChapter(idx, 'title', e.target.value)}
                  style={{ flex: 2, padding: 8, background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, color: '#fff' }}
                />
                <input
                  type="number"
                  placeholder="Start (sec)"
                  value={ch.start_time_seconds}
                  onChange={(e) => updateChapter(idx, 'start_time_seconds', e.target.value)}
                  min="0"
                  style={{ width: 100, padding: 8, background: '#1a1a2e', border: '1px solid #333', borderRadius: 6, color: '#fff' }}
                />
                {chapters.length > 1 && (
                  <button type="button" onClick={() => removeChapterRow(idx)} style={{ background: 'none', border: 'none', color: '#ff5c72', cursor: 'pointer' }}><FiTrash2 /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addChapterRow} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
              <FiPlusCircle /> Add Chapter
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveChapters} disabled={isSavingChapters} className="submit-btn">
                {isSavingChapters ? 'Saving...' : 'Save Chapters'}
              </button>
              <button onClick={() => { navigate('/creator/series'); }} className="cancel-btn">Skip</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadEpisode;