import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './BecomeCreatorButton.css'; // optional

const BecomeCreatorButton = () => {
  const { user, becomeCreator } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    const result = await becomeCreator();
    setIsLoading(false);
    if (result.success) {
      navigate('/creator/dashboard');
    }
  };

  if (user?.role === 'creator' || user?.is_creator) return null;

  return (
    <button onClick={handleClick} disabled={isLoading} className="become-creator-btn">
      {isLoading ? 'Processing...' : 'Become a Creator'}
    </button>
  );
};

export default BecomeCreatorButton;
