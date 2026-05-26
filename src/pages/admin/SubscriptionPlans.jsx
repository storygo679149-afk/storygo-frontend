import React, { useEffect, useState } from 'react';
import { FiCreditCard, FiPlus, FiSave } from 'react-icons/fi';
import apiService from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import toast from 'react-hot-toast';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0, interval: 'month', trial_days: 0 });

  const fetchPlans = async () => {
    try {
      const { data } = await apiService.get('/payments/plans');
      setPlans(data.plans);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const savePlan = async (plan) => {
    try {
      await apiService.put(`/admin/plans/${plan.id}`, form);
      toast.success('Plan updated');
      setEditPlan(null);
      fetchPlans();
    } catch {
      toast.error('Update failed');
    }
  };

  const createPlan = async () => {
    try {
      await apiService.post('/admin/plans', form);
      toast.success('Plan created');
      setEditPlan(null);
      fetchPlans();
    } catch {
      toast.error('Create failed');
    }
  };

  return (
    <div className="admin-page">
      <h1><FiCreditCard /> Plans & Offers</h1>
      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditPlan({}); setForm({ name: '', price: 0, interval: 'month', trial_days: 0 }); }}>
          <FiPlus /> New Plan
        </button>
      </div>
      {loading ? (
        <div className="admin-loading"><SkeletonLoader type="card" count={4} /></div>
      ) : plans.length === 0 ? (
        <div className="empty-state"><p>No plans available</p></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Price (₹)</th><th>Interval</th><th>Trial (days)</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>₹{p.price_amount / 100}/{p.interval}</td>
                <td>{p.interval}</td>
                <td>{p.trial_days || 0}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => { setEditPlan(p); setForm(p); }}><FiSave /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editPlan && (
        <div className="modal-overlay" onClick={() => setEditPlan(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editPlan.id ? 'Edit Plan' : 'Create Plan'}</h2>
            <form className="modal-form" onSubmit={e => { e.preventDefault(); editPlan.id ? savePlan(editPlan) : createPlan(); }}>
              <div className="form-group"><label>Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Price (in paise)</label><input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div className="form-group"><label>Interval</label>
                <select className="form-select" value={form.interval} onChange={e => setForm({...form, interval: e.target.value})}>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <div className="form-group"><label>Trial Days</label><input className="form-input" type="number" value={form.trial_days} onChange={e => setForm({...form, trial_days: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditPlan(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;