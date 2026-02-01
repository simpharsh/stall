import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrderHistory = ({ refreshTrigger }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const fetchHistory = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching history:', error);
        } else {
            setHistory(data || []);
        }
    };

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
            <header>
                <h2>Order History</h2>
            </header>
            <div className="table-container scrollable">
                <table id="historyTable">
                    <thead>
                        <tr>
                            <th>Dish & Time</th>
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
