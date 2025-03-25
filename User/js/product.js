function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const header = document.querySelector(".header");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    const isSidebarOpen = sidebar.classList.contains("active");
    header.classList.toggle("fixed", isSidebarOpen);
}

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("Search");
    const productList = document.getElementById("product-list");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const currentPageIndicator = document.getElementById("current-page");

    let allMedicines = [];
    let filteredMedicines = [];
    let currentPage = 1;
    const itemsPerPage = 16;

    try {
        const response = await fetch("http://localhost:3000/medicines");
        allMedicines = shuffleArray(await response.json()); // Shuffle products
        filteredMedicines = [...allMedicines]; // Initially, filtered list is the same as all products
        displayMedicines();
    } catch (error) {
        console.error("Error fetching medicines:", error);
    }

    function shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    function displayMedicines() {
        productList.innerHTML = "";

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = filteredMedicines.slice(start, end);

        paginatedData.forEach((med) => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${med.Image_url}" alt="${med.Name}">
                <h3>${med.Name}</h3>
                <p>${med.Price}</p>
                <div class="quantity-container">
                    <button class="quantity-btn decrease">-</button>
                    <input type="number" class="quantity-input" value="1" min="1">
                    <button class="quantity-btn increase">+</button>
                </div>
                <button class="buy-btn">Add to Cart</button>
            `;

            productList.appendChild(productCard);

            const quantityInput = productCard.querySelector(".quantity-input");

            productCard.querySelector(".decrease").addEventListener("click", () => {
                quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
            });

            productCard.querySelector(".increase").addEventListener("click", () => {
                quantityInput.value = Number(quantityInput.value) + 1;
            });

            productCard.querySelector(".buy-btn").addEventListener("click", async () => {
                const orderData = {
                    medicineName: med.Name,
                    quantity: parseInt(quantityInput.value),
                    price: parseFloat(med.Price.toString().replace(/[^\d.]/g, "")) * parseInt(quantityInput.value),
                };

                try {
                    const response = await fetch("http://localhost:3000/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData),
                    });
                    const data = await response.json();
                    alert(data.message);
                } catch (error) {
                    console.error("Error placing order:", error);
                }
            });
        });

        updatePagination();
    }

    function updatePagination() {
        currentPageIndicator.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = (currentPage * itemsPerPage) >= filteredMedicines.length;
    }

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayMedicines();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if ((currentPage * itemsPerPage) < filteredMedicines.length) {
            currentPage++;
            displayMedicines();
        }
    });

    // 🔍 Search Functionality (By First Letter)
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        if (query === "") {
            filteredMedicines = [...allMedicines]; // Reset to full list when search is cleared
        } else {
            filteredMedicines = allMedicines.filter((med) =>
                med.Name.toLowerCase().startsWith(query)
            );
        }

        currentPage = 1; // Reset to first page on new search
        displayMedicines();
    });
});
