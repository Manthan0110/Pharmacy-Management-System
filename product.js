document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('Search');
    const productList = document.getElementById('product-list');

    function fetchMedicines(query = '') {
        const url = query 
            ? `http://localhost:3000/medicines/search?name=${encodeURIComponent(query)}`
            : 'http://localhost:3000/medicines';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                productList.innerHTML = '';

                data.slice(0, 10).forEach(medicine => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
                        <img src="${medicine.Image_url}" alt="${medicine.Name}">
                        <h3>${medicine.Name}</h3>
                        <p>${medicine.Price}</p>

                        <div class="quantity-container">
                            <button class="quantity-btn decrease">-</button>
                            <input type="number" class="quantity-input" value="1" min="1">
                            <button class="quantity-btn increase">+</button>
                        </div>

                        <button class="buy-btn">Add to Cart</button>
                    `;
                    productList.appendChild(productCard);

                    // Quantity Buttons
                    const decreaseBtn = productCard.querySelector('.decrease');
                    const increaseBtn = productCard.querySelector('.increase');
                    const quantityInput = productCard.querySelector('.quantity-input');
                    const addToCartBtn = productCard.querySelector('.buy-btn');

                    // Decrease Quantity
                    decreaseBtn.addEventListener('click', () => {
                        if (quantityInput.value > 1) {
                            quantityInput.value--;
                        }
                    });

                    // Increase Quantity
                    increaseBtn.addEventListener('click', () => {
                        quantityInput.value++;
                    });

                    // Add to Cart Button
                    addToCartBtn.addEventListener('click', () => {
                        const quantity = quantityInput.value;
                        const totalPrice = parseFloat(medicine.Price.replace('₹', '')) * quantity;

                        const orderData = {
                            medicineName: medicine.Name,
                            quantity: quantity,
                            price: totalPrice
                        };

                        // Send Order to Backend
                        fetch('http://localhost:3000/orders', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(orderData)
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message);  // Success message
                        })
                        .catch(error => console.error('Error placing order:', error));
                    });
                });
            })
            .catch(error => console.error('Error fetching medicines:', error));
    }

    // Initial fetch to load the first 10 medicines
    fetchMedicines();

    // Search functionality
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.trim();
        fetchMedicines(query);
    });
});
