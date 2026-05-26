import React, { useState, useEffect } from 'react';
import { FiSearch, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SeoTools = () => {
  const [seriesId, setSeriesId] = useState('');
  const [meta, setMeta] = useState({ title: '', description: '', slug: '', tags: '' });
  const [allSeries, setAllSeries] = useState([]);

  useEffect(() => {
    // fetch series list for select
    // adminService.getSeries().then(...);
  }, []);

  const loadSeries = async (id) => {
    // fetch SEO data for series
    setMeta({ title: 'Sample Title', description: 'Sample desc', slug: 'sample-slug', tags: 'action, drama' });
  };

  const save = () => {
    toast.success('SEO settings saved');
  };

  return (
    <div className="admin-page">
      <h1><FiSearch /> SEO & Discoverability</h1>
      <div className="admin-toolbar">
        <select className="filter-select" value={seriesId} onChange={e => { setSeriesId(e.target.value); loadSeries(e.target.value); }}>
          <option value="">Select a series</option>
          {/* map allSeries */}
        </select>
      </div>
      {seriesId && (
        <div className="form-group" style={{ display: 'grid', gap: '16px', maxWidth: '600px' }}>
          <div className="form-group"><label>Meta Title</label><input className="form-input" value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} /></div>
          <div className="form-group"><label>Meta Description</label><textarea className="form-textarea" rows="3" value={meta.description} onChange={e => setMeta({...meta, description: e.target.value})} /></div>
          <div className="form-group"><label>Slug</label><input className="form-input" value={meta.slug} onChange={e => setMeta({...meta, slug: e.target.value})} /></div>
          <div className="form-group"><label>Tags (comma separated)</label><input className="form-input" value={meta.tags} onChange={e => setMeta({...meta, tags: e.target.value})} /></div>
          <button className="btn btn-primary" onClick={save}><FiSave /> Save SEO Settings</button>
        </div>
      )}
    </div>
  );
};

export default SeoTools;