import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const OrderHistory = ({ refreshTrigger }) => {
    const [history, setHistory] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const fetchHistory = useCallback(async () => {
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        const today = new Date();

        if (startTime && endTime) {
            // Filter by specific time range today
            const [startH, startM] = startTime.split(':');
            const start = new Date(today);
            start.setHours(parseInt(startH), parseInt(startM), 0, 0);

            const [endH, endM] = endTime.split(':');
            const end = new Date(today);
            end.setHours(parseInt(endH), parseInt(endM), 59, 999);

            query = query
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());
        } else {
            // Default: Filter by today (since midnight local time)
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);

            query = query.gte('created_at', startOfDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching history:', error);
        } else {
            setHistory(data || []);
        }
    }, [startTime, endTime]);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger, fetchHistory]);

    const markAsPaid = async (orderId) => {
        if (!window.confirm("Are you sure you want to mark this order as Paid?")) return;

        const { error } = await supabase
            .from('orders')
            .update({ payment_status: 'Paid' })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } else {
            // Optimistic update or refresh
            setHistory(prev => prev.map(order =>
                order.id === orderId ? { ...order, payment_status: 'Paid' } : order
            ));
        }
    };

    return (
        <section className="history-section glass-panel">
            <header className="history-header">
                <h2>Order History</h2>
                <div className="filter-controls">
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        aria-label="Start Time"
                    />
                    <span>to</span>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        aria-label="End Time"
                    />
                </div>
            </header>
            <div className="table-container scrollable">
                <table id="historyTable">
                    <thead>
                        <tr>
                            <th>Dish & Time</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(order => (
                            <tr key={order.id}>
                                <td>
                                    <div>{order.dish_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '500' }}>{order.customer_name || '-'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#a0a0b0' }}>{order.mobile_number || ''}</div>
                                </td>
                                <td>₹{order.total_price}</td>
                                <td>{order.payment_method}</td>
                                <td className={order.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}>
                                    {order.payment_status === 'Paid' ? (
                                        '✅ Paid'
                                    ) : (
                                        <button
                                            className="mark-paid-btn"
                                            onClick={() => markAsPaid(order.id)}
                                            style={{
                                                background: 'var(--accent-primary, #ffaa40)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                color: '#1a1a2e',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default OrderHistory;
