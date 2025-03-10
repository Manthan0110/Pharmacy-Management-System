document.addEventListener('DOMContentLoaded', function () {
    fetchOrders();
    addConfirmButton();
});

// ✅ Fetch and display orders
function fetchOrders() {
    fetch('http://localhost:3000/orders')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch orders");
            return response.json();
        })
        .then(data => {
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = '';

            data.forEach(order => {
                const row = document.createElement('tr');
                row.setAttribute("data-order-id", order.id);

                let totalPrice = parseFloat(order.price);
                let quantity = parseInt(order.quantity);
                let unitPrice = totalPrice / quantity;

                row.innerHTML = `
                    <td>${order.medicine_name}</td>
                    <td>
                        <input type="number" class="quantity-input" value="${quantity}" min="1" 
                            data-id="${order.id}" data-unitprice="${unitPrice}" onchange="updateTotal(this)">
                    </td>
                    <td class="price">₹${totalPrice.toFixed(2)}</td>
                    <td>${new Date(order.order_date).toLocaleString()}</td>
                    <td><button class="cancel-btn" onclick="deleteOrder(this, ${order.id})">Delete</button></td>
                `;

                ordersList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

// ✅ Remove order permanently
function deleteOrder(button, orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    fetch(`http://localhost:3000/orders/${orderId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error("Failed to cancel order");
            let row = button.closest("tr");
            row.remove();
            alert("Order cancelled successfully!");
        })
        .catch(error => console.error("Error deleting order:", error));
}

// ✅ Update total price when quantity changes
function updateTotal(input) {
    let row = input.closest("tr"); 
    let priceCell = row.querySelector(".price"); 

    let unitPrice = parseFloat(input.dataset.unitprice);
    let newQuantity = parseInt(input.value);

    if (isNaN(unitPrice) || isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        input.value = 1;
    }

    let newTotal = unitPrice * newQuantity;
    priceCell.textContent = `₹${newTotal.toFixed(2)}`;
}

// ✅ Confirm all orders
function confirmOrders() {
    if (!confirm("Are you sure you want to confirm all orders?")) return;

    const updatedOrders = [];
    document.querySelectorAll("#orders-list tr").forEach(row => {
        const orderId = row.getAttribute("data-order-id");
        const quantityInput = row.querySelector(".quantity-input");
        const quantity = quantityInput ? parseInt(quantityInput.value, 10) : null;

        if (orderId && !isNaN(quantity)) {
            updatedOrders.push({ orderId: parseInt(orderId, 10), quantity });
        }
    });

    if (updatedOrders.length === 0) {
        alert("No orders to confirm!");
        return;
    }

    fetch('http://localhost:3000/orders/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: updatedOrders })
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to confirm orders");
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('orders-list').innerHTML = ''; 
            alert("All orders confirmed successfully!");
        } else {
            alert("Failed to confirm orders. Please try again.");
        }
    })
    .catch(error => console.error("Error confirming orders:", error));
}

// ✅ Add "Confirm Orders" button dynamically
function addConfirmButton() {
    let ordersContainer = document.querySelector('.orders-container');
    let confirmButton = document.createElement('button');
    confirmButton.textContent = "Confirm Orders";
    confirmButton.onclick = confirmOrders;
    confirmButton.classList.add("confirm-btn");
    ordersContainer.appendChild(confirmButton);
}
