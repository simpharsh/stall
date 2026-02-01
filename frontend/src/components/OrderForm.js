import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrderForm = ({ onOrderAdded }) => {
    const [menu, setMenu] = useState([]);
    const [selectedDishId, setSelectedDishId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('GPay');
    const [isPaid, setIsPaid] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        const { data, error } = await supabase.from('menu').select('*');
        if (error) console.error('Error fetching menu:', error);
        else setMenu(data || []);
        setLoading(false);
    };

    const getPrice = () => {
        const dish = menu.find(d => d.id === parseInt(selectedDishId));
        return dish ? (dish.price * quantity).toFixed(2) : '0.00';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDishId) return;

        const dish = menu.find(d => d.id === parseInt(selectedDishId));
        const pricePerUnit = dish.price;
        const totalPrice = pricePerUnit * quantity;

        const { error } = await supabase.from('orders').insert([
            {
                dish_id: parseInt(selectedDishId),
                dish_name: dish.name,
                quantity: quantity,
                price_per_unit: pricePerUnit,
                total_price: totalPrice,
                payment_method: paymentMethod,
                payment_status: isPaid ? 'Paid' : 'Pending'
            }
        ]);

        if (error) {
            alert('Error adding order: ' + error.message);
        } else {
            // Reset form
            setSelectedDishId('');
            setQuantity(1);
            if (onOrderAdded) onOrderAdded();
        }
    };

    return (
        <section className="order-section glass-panel">
            <header>
                <h1>New Order</h1>
            </header>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="dishSelect">Select Dish</label>
                    <select
                        id="dishSelect"
                        value={selectedDishId}
                        onChange={(e) => setSelectedDishId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a dish...</option>
                        {menu.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} - ₹{item.price}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <div className="qty-control">
                            <button type="button" className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                required
                            />
                            <button type="button" className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Payment Method</label>
                    <div className="radio-group">
                        <label className="radio-card">
                            <input
                                type="radio"
                                name="payment_method"
                                value="GPay"
                                checked={paymentMethod === 'GPay'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="radio-label">GPay</span>
                        </label>
                        <label className="radio-card">
                            <input
                                type="radio"
                                name="payment_method"
                                value="Cash"
                                checked={paymentMethod === 'Cash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span className="radio-label">Cash</span>
                        </label>
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                        />
                        <span className="checkmark"></span>
                        Payment Done
                    </label>
                </div>

                <div className="total-price-section">
                    <span>Total:</span>
                    <span>₹{getPrice()}</span>
                </div>

                <button type="submit" className="btn-primary">Add Order</button>
            </form>
        </section>
    );
};

export default OrderForm;
