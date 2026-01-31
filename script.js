document.addEventListener('DOMContentLoaded', () => {
    const dishSelect = document.getElementById('dishSelect');
    const quantityInput = document.getElementById('quantity');
    const qtyInc = document.getElementById('qtyInc');
    const qtyDec = document.getElementById('qtyDec');
    const priceDisplay = document.getElementById('priceDisplay');
    const orderForm = document.getElementById('orderForm');

    let menuData = [];

    // Load Menu
    fetch('api.php?action=get_menu')
        .then(response => response.json())
        .then(data => {
            menuData = data;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.name} - ₹${item.price}`;
                dishSelect.appendChild(option);
            });
        })
        .catch(err => console.error('Error loading menu:', err));

    // Update Price on Selection/Change
    function updatePrice() {
        const selectedId = dishSelect.value;
        const qty = parseInt(quantityInput.value) || 0;

        const item = menuData.find(d => d.id == selectedId);
        if (item) {
            const total = item.price * qty;
            priceDisplay.textContent = `₹${total.toFixed(2)}`;
        } else {
            priceDisplay.textContent = '₹0.00';
        }
    }

    dishSelect.addEventListener('change', updatePrice);
    quantityInput.addEventListener('input', updatePrice);

    // Quantity Buttons
    qtyInc.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updatePrice();
    });

    qtyDec.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) {
            quantityInput.value = current - 1;
            updatePrice();
        }
    });

    // Handle Order Submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            dish_id: dishSelect.value,
            quantity: quantityInput.value,
            payment_method: document.querySelector('input[name="payment_method"]:checked').value,
            payment_status: document.getElementById('paymentStatus').checked
        };

        fetch('api.php?action=add_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    // Reset form but keep some defaults if needed
                    quantityInput.value = 1;
                    dishSelect.value = "";
                    updatePrice();

                    // Refresh tables
                    loadSummary();
                    loadHistory();
                } else {
                    alert('Error adding order');
                }
            })
            .catch(err => console.error('Error:', err));
    });

    // Load Live Summary
    function loadSummary() {
        fetch('api.php?action=get_summary')
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector('#summaryTable tbody');
                tbody.innerHTML = '';

                data.items.forEach(item => {
                    const row = `
                        <tr>
                            <td>${item.dish_name}</td>
                            <td>${item.total_qty}</td>
                            <td>₹${item.total_revenue}</td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });

                document.getElementById('totalServedCount').textContent = data.items.reduce((acc, curr) => acc + parseInt(curr.total_qty), 0);
                document.getElementById('totalRevenue').textContent = `₹${parseFloat(data.grand_total || 0).toFixed(2)}`;
            });
    }

    // Load History
    function loadHistory() {
        fetch('api.php?action=get_history')
            .then(res => res.json())
            .then(data => {
                const tbody = document.querySelector('#historyTable tbody');
                tbody.innerHTML = '';

                data.forEach(order => {
                    const statusClass = order.payment_status === 'Paid' ? 'status-paid' : 'status-pending';
                    const icon = order.payment_status === 'Paid' ? '✅' : '⏳';

                    const row = `
                        <tr>
                            <td>
                                <div>${order.dish_name}</div>
                                <div style="font-size: 0.8rem; color: #a0a0b0;">${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td>₹${order.total_price}</td>
                            <td>${order.payment_method}</td>
                            <td class="${statusClass}">${icon} ${order.payment_status}</td>
                        </tr>
                    `;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            });
    }

    // Initial Load
    loadSummary();
    loadHistory();

    // Poll for updates every 10 seconds? Optional, but good for "Live" feel
    setInterval(() => {
        loadSummary();
        loadHistory();
    }, 10000);
});
