import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      // After login, check if admin (can also be verified in the backend)
      // Here we'll just try to access dashboard; if not admin, the API will return 403
      navigate('/admin');
    } else {
      toast.error('Login failed');
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};

export default AdminLogin;