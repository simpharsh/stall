import React, { useState, useEffect } from 'react';
import './index.css';
import OrderForm from './components/OrderForm';
import LiveSummary from './components/LiveSummary';
import OrderHistory from './components/OrderHistory';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOrderAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Optional: Auto-refresh every 10 seconds to keep live view updated
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <OrderForm onOrderAdded={handleOrderAdded} />
      <LiveSummary refreshTrigger={refreshTrigger} />
      <OrderHistory refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
