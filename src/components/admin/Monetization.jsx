import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminMonetization.css';

const AdminMonetization = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [promoCode, setPromoCode] = useState({ code: '', discount_type: 'percentage', discount_value: '', valid_until: '', usage_limit: 1 });
  const [activeTab, setActiveTab] = useState('subs');

  useEffect(() => {
    fetchSubscriptions();
    fetchPayouts();
  }, []);

  const fetchSubscriptions = async () => {
    const res = await api.get('/admin/subscriptions');
    setSubscriptions(res.data.data);
  };
  const fetchPayouts = async () => {
    const res = await api.get('/admin/payouts');
    setPayouts(res.data.data);
  };
  const createPromo = async () => {
    try {
      await api.post('/admin/promo-codes', promoCode);
      toast.success('Promo code created');
      setPromoCode({ code: '', discount_type: 'percentage', discount_value: '', valid_until: '', usage_limit: 1 });
    } catch (err) {
      toast.error('Failed to create promo');
    }
  };
  const processPayout = async (id) => {
    try {
      await api.post(`/admin/payouts/${id}/process`);
      toast.success('Payout processed');
      fetchPayouts();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <motion.div className="admin-monetization">
      <div className="admin-tabs">
        <button className={activeTab === 'subs' ? 'active' : ''} onClick={() => setActiveTab('subs')}>Subscriptions</button>
        <button className={activeTab === 'payouts' ? 'active' : ''} onClick={() => setActiveTab('payouts')}>Payouts</button>
        <button className={activeTab === 'promo' ? 'active' : ''} onClick={() => setActiveTab('promo')}>Promo Codes</button>
      </div>

      {activeTab === 'subs' && (
        <table className="admin-table">
          <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Start Date</th><th>End Date</th></tr></thead>
          <tbody>
            {subscriptions.map(s => (
              <tr key={s.id}>
                <td>{s.username}</td><td>{s.plan_name}</td><td>{s.status}</td>
                <td>{new Date(s.start_date).toLocaleDateString()}</td>
                <td>{s.end_date ? new Date(s.end_date).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'payouts' && (
        <table className="admin-table">
          <thead><tr><th>Creator</th><th>Amount</th><th>Status</th><th>Period</th><th>Action</th></tr></thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td>{p.username}</td><td>${p.amount}</td><td>{p.status}</td>
                <td>{p.period_start} to {p.period_end}</td>
                <td>{p.status === 'pending' && <button onClick={() => processPayout(p.id)}>Mark Completed</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 'promo' && (
        <div className="promo-form">
          <input type="text" placeholder="Code" value={promoCode.code} onChange={e => setPromoCode({...promoCode, code: e.target.value})} />
          <select value={promoCode.discount_type} onChange={e => setPromoCode({...promoCode, discount_type: e.target.value})}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" placeholder="Discount value" value={promoCode.discount_value} onChange={e => setPromoCode({...promoCode, discount_value: e.target.value})} />
          <input type="datetime-local" value={promoCode.valid_until} onChange={e => setPromoCode({...promoCode, valid_until: e.target.value})} />
          <input type="number" placeholder="Usage limit" value={promoCode.usage_limit} onChange={e => setPromoCode({...promoCode, usage_limit: e.target.value})} />
          <button onClick={createPromo}>Create Promo Code</button>
        </div>
      )}
    </motion.div>
  );
};
export default AdminMonetization;
