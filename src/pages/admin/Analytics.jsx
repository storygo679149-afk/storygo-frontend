import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminAnalytics.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d84c4c'];

const AdminAnalytics = () => {
  const [range, setRange] = useState('week');
  const [data, setData] = useState({ plays: [], dropoff: [], genres: [], devices: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?range=${range}`);
      setData(res.data.data);
    } catch (err) { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="admin-loading">Loading analytics...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="range-buttons">
          <button className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>Week</button>
          <button className={range === 'month' ? 'active' : ''} onClick={() => setRange('month')}>Month</button>
          <button className={range === 'year' ? 'active' : ''} onClick={() => setRange('year')}>Year</button>
        </div>
      </div>
      <div className="analytics-grid">
        <div className="chart-card"><h3>Daily Plays</h3><ResponsiveContainer width="100%" height={300}><LineChart data={data.plays}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="count" stroke="#8884d8" /></LineChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Episode Drop‑off</h3><ResponsiveContainer width="100%" height={300}><BarChart data={data.dropoff} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="title" width={150} /><Tooltip /><Bar dataKey="avg_progress" fill="#82ca9d" /></BarChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Genre Distribution</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.genres} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{data.genres.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="chart-card"><h3>Device Breakdown</h3><ResponsiveContainer width="100%" height={300}><BarChart data={data.devices}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="device" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#ffc658" /></BarChart></ResponsiveContainer></div>
      </div>
    </motion.div>
  );
};
export default AdminAnalytics;
