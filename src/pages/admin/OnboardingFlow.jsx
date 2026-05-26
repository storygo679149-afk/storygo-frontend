import React, { useState } from 'react';
import { FiUserPlus, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OnboardingFlow = () => {
  const [welcomeText, setWelcomeText] = useState('Discover audio stories');
  const [genreSelection, setGenreSelection] = useState(true);
  const [tutorialSteps, setTutorialSteps] = useState([{ title: 'Welcome', content: 'Swipe to browse' }]);

  const save = () => {
    toast.success('Onboarding flow updated');
  };

  return (
    <div className="admin-page">
      <h1><FiUserPlus /> Onboarding Flow</h1>
      <div style={{ display: 'grid', gap: '24px', maxWidth: '700px' }}>
        <div className="stat-card">
          <h3>Welcome Screen</h3>
          <div className="form-group">
            <label>Message</label>
            <textarea className="form-textarea" rows="3" value={welcomeText} onChange={e => setWelcomeText(e.target.value)} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Genre Selection</h3>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={genreSelection} onChange={e => setGenreSelection(e.target.checked)} />
            <label>Enable genre selection step</label>
          </div>
        </div>
        <button className="btn btn-primary" onClick={save}><FiSave /> Save</button>
      </div>
    </div>
  );
};

export default OnboardingFlow;