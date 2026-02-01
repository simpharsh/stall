import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const LiveSummary = ({ refreshTrigger }) => {
    const [summary, setSummary] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        fetchSummary();
    }, [refreshTrigger]);

    const fetchSummary = async () => {
        // Get start of day (local time approx)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('orders')
            .select('dish_name, quantity, total_price')
            .gte('created_at', today.toISOString());

        if (error) {
            console.error('Error fetching summary:', error);
            return;
        }

        // Aggregate Data
        const agg = {};
        let totalRev = 0;

        data.forEach(order => {
            if (!agg[order.dish_name]) {
                agg[order.dish_name] = { dish_name: order.dish_name, total_qty: 0, total_revenue: 0 };
            }
            agg[order.dish_name].total_qty += order.quantity;
            agg[order.dish_name].total_revenue += order.total_price;
            totalRev += order.total_price;
        });

        setSummary(Object.values(agg));
        setGrandTotal(totalRev);
    };

    return (
        <section className="summary-section glass-panel">
            <header>
                <h2>Live Serving Status</h2>
                <span className="badge">Today</span>
            </header>
            <div className="table-container">
                <table id="summaryTable">
                    <thead>
                        <tr>
                            <th>Menu Item</th>
                            <th>Served</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.length === 0 ? (
                            <tr><td colSpan="3">No orders today</td></tr>
                        ) : (
                            summary.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.dish_name}</td>
                                    <td>{item.total_qty}</td>
                                    <td>₹{item.total_revenue.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td id="totalServedCount">{summary.reduce((acc, curr) => acc + curr.total_qty, 0)}</td>
                            <td id="totalRevenue">₹{grandTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
};

export default LiveSummary;
