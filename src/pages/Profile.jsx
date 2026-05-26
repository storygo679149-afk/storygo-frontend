import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiService from '../services/api';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2,
  FiCamera, FiTrash2, FiSave, FiLock, FiEye,
  FiEyeOff, FiCheckCircle, FiLoader, FiAlertCircle,
  FiShield, FiKey, FiUserPlus
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

const Profile = () => {
  const { user, setUser, isAuthenticated, updateProfile, changePassword, becomeCreator } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBecomingCreator, setIsBecomingCreator] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fileInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.creator_bio || user.bio || '',
        location: user.location || ''
      });
      setAvatarPreview(user.profile_picture || user.avatar || null);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="profile-unauthorized">
        <FiAlertCircle size={48} />
        <h2>Please log in to view your profile</h2>
        <button onClick={() => navigate('/login')}>Sign In</button>
      </div>
    );
  }

  const triggerFileSelect = () => fileInputRef.current?.click();

  const processAvatarFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setIsUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const response = await apiService.upload('/users/avatar', fd);
      const newAvatarUrl = response.data.avatarUrl;
      if (newAvatarUrl) {
        setUser({ ...user, profile_picture: newAvatarUrl });
        toast.success('Profile picture updated');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setAvatarPreview(user?.profile_picture || null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    setIsUploading(true);
    try {
      await apiService.delete('/users/avatar');
      setUser({ ...user, profile_picture: null });
      setAvatarPreview(null);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Removal failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); dragZoneRef.current?.classList.add('drag-over'); };
  const handleDragLeave = (e) => { e.preventDefault(); dragZoneRef.current?.classList.remove('drag-over'); };
  const handleDrop = (e) => {
    e.preventDefault();
    dragZoneRef.current?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processAvatarFile(file);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const profilePayload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        creator_bio: formData.bio,
        location: formData.location
      };
      const result = await updateProfile(profilePayload);
      if (result.success) {
        toast.success('Profile updated');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBecomeCreator = async () => {
    setIsBecomingCreator(true);
    try {
      const result = await becomeCreator();
      if (result.success) {
        toast.success('You are now a creator!');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsBecomingCreator(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSaving(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      // error already handled
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div className="profile-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account and personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <FiUser /> Profile Info
          </button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <FiShield /> Security
          </button>
        </div>

        <div className="profile-panel">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="profile-form-container"
              >
                <div className="avatar-section">
                  <div
                    className="avatar-upload-zone"
                    ref={dragZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                  >
                    <div className="avatar-preview">
                      {avatarPreview ? <img src={avatarPreview} alt="Profile" /> : <div className="avatar-placeholder"><FiUser size={40} /></div>}
                      {isUploading && <div className="upload-overlay"><FiLoader className="spinner" /></div>}
                    </div>
                    <div className="avatar-actions">
                      <button type="button" className="avatar-action-btn" onClick={triggerFileSelect}><FiCamera /> Upload</button>
                      {avatarPreview && <button type="button" className="avatar-action-btn remove" onClick={removeAvatar}><FiTrash2 /> Remove</button>}
                    </div>
                    <p className="drag-hint">Drag & drop or click to upload (max 5MB)</p>
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => processAvatarFile(e.target.files[0])} />
                  </div>
                </div>

                <motion.form className="profile-form" onSubmit={handleSaveProfile} variants={containerVariants} initial="hidden" animate="visible">
                  <motion.div className="form-group" variants={itemVariants}>
                    <label><FiUser /> Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </motion.div>
                  <motion.div className="form-group" variants={itemVariants}>
                    <label><FiMail /> Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled />
                  </motion.div>
                  <motion.div className="form-group" variants={itemVariants}>
                    <label><FiPhone /> Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </motion.div>
                  <motion.div className="form-group" variants={itemVariants}>
                    <label><FiMapPin /> Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                  </motion.div>
                  <motion.div className="form-group" variants={itemVariants}>
                    <label><FiEdit2 /> Bio</label>
                    <textarea name="bio" rows="3" value={formData.bio} onChange={handleInputChange} />
                  </motion.div>

                  {!user?.is_creator && (
                    <motion.div className="become-creator-section" variants={itemVariants}>
                      <button
                        type="button"
                        className="become-creator-btn"
                        onClick={handleBecomeCreator}
                        disabled={isBecomingCreator}
                      >
                        {isBecomingCreator ? <><FiLoader className="spinner" /> Processing...</> : <><FiUserPlus /> Become a Creator</>}
                      </button>
                      <p>Create your own series and share your stories with the world.</p>
                    </motion.div>
                  )}

                  {user?.is_creator && (
                    <motion.div className="creator-badge" variants={itemVariants}>
                      <FiCheckCircle /> You are a verified creator
                    </motion.div>
                  )}

                  <motion.div className="form-actions" variants={itemVariants}>
                    <button type="submit" className="save-btn" disabled={isSaving}>
                      {isSaving ? <FiLoader className="spinner" /> : <FiSave />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="security-form-container"
              >
                <div className="security-header">
                  <FiKey size={28} />
                  <h3>Change Password</h3>
                  <p>Keep your account secure</p>
                </div>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label><FiLock /> Current Password</label>
                    <div className="password-input-wrapper">
                      <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                      <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <FiEyeOff /> : <FiEye />}</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label><FiLock /> New Password</label>
                    <div className="password-input-wrapper">
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
                      <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <FiEyeOff /> : <FiEye />}</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label><FiCheckCircle /> Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={isSaving}>
                      {isSaving ? <FiLoader className="spinner" /> : <FiSave />} Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;