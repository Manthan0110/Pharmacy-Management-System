// document.addEventListener("DOMContentLoaded", function() {
//     let user = localStorage.getItem("user");
//     if (!user && window.location.pathname !== "/User/html/login.html") {
//         window.location.href = "/User/html/login.html";
//     }
// });

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const header = document.querySelector(".header");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px"; // Hide Sidebar
        header.classList.remove("fixed"); // Remove Fixed Position
    } else {
        sidebar.style.left = "0px"; // Show Sidebar
        header.classList.add("fixed"); // Make Header Fixed
    }
}

document.addEventListener("DOMContentLoaded", function () { 
    const banners = ["/offer-banner.png", "/offer-banner1.png", "/offer-banner3.png"];
    let currentIndex = 0;
    const bannerImg = document.querySelector(".offer-banner .banner");
    const nextBtns = document.querySelectorAll(".offer-banner .next-btn");

    function changeBanner(next = true) {  
        bannerImg.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";
        bannerImg.style.transform = next ? "translateX(-100%)" : "translateX(100%)";
        bannerImg.style.opacity = "0";

        setTimeout(() => {  
            currentIndex = next  
                ? (currentIndex + 1) % banners.length  
                : (currentIndex - 1 + banners.length) % banners.length;

            bannerImg.src = banners[currentIndex];  
            bannerImg.style.transition = "none";
            bannerImg.style.transform = next ? "translateX(100%)" : "translateX(-100%)";

            setTimeout(() => {  
                bannerImg.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";  
                bannerImg.style.transform = "translateX(0)";  
                bannerImg.style.opacity = "1";  
            }, 50);  
        }, 100);  
    }

    nextBtns[0].addEventListener("click", () => changeBanner(false));  
    nextBtns[1].addEventListener("click", () => changeBanner(true));  
});

fetchProducts();

function fetchMedicines(category) {
    console.log(`Fetching medicines for category: ${category}`); // Debugging log

    fetch(`http://localhost:3000/medicines/${category}`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data); // Debugging log
            const container = document.getElementById("product-container");
            container.innerHTML = ""; 

            if (data.length === 0) {
                container.innerHTML = "<p>No products available in this category.</p>";
                return;
            }

            data.forEach(medicine => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${medicine.image_url}" alt="${medicine.name}" class="product-image">
                    <h2 class="product-name">${medicine.name}</h2>
                    <p class="product-price">${medicine.price}</p>
                    <div class="quantity-selector">
                        <button class="quantity-btn decrease">-</button>
                        <input type="number" class="quantity-input" value="1" min="1">
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                `;
                container.appendChild(productCard);
            });

            console.log("Products loaded. Attaching event listeners..."); // Debugging log

            addQuantityButtonListeners();  
            addCartFunctionality();  
        })
        .catch(error => console.error("Error fetching medicines:", error));
}


document.getElementById("Search").addEventListener("input", function() {
    const query = this.value.trim();
    if (query.length === 0) {
        document.getElementById("medicine-info").innerHTML = "";
        return;
    }

    fetch(`http://localhost:3000/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            let resultHTML = "<div class='search-results'>";
            if (data.length > 0) {
                data.forEach(medicine => {
                    resultHTML += `
                        <div class="product-card">
                            <img src="${medicine.image_url}" alt="${medicine.name}" class="product-image">
                            <h2 class="product-name">${medicine.name}</h2>
                            <p class="product-price">${medicine.price}</p>
                            <button class="add-to-cart">Add to Cart</button>
                        </div>
                    `;
                });
            }
            resultHTML += "</div>";
            document.getElementById("medicine-info").innerHTML = resultHTML;
            addQuantityButtonListeners();
            addCartFunctionality();
        })
        .catch(error => console.error("Error fetching search results:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
    const searchInput = document.getElementById("Search");

    searchInput.addEventListener("input", function() {
        const query = searchInput.value.trim();
        const container = document.querySelector(".product-container");
        
        if (query.length === 0) {
            fetchProducts(); 
            return;
        }

        fetch(`http://localhost:3000/search?q=${query}`)
            .then(response => response.json())
            .then(data => {
                document.querySelectorAll(".product-card").forEach(el => el.remove());

                if (data.length === 0) {
                    container.innerHTML += "<p class='no-results'>No products found.</p>";
                    return;
                }

                data.slice(0, 10).forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card");
                    productCard.innerHTML = `
                        <img src="${product.image_url}" alt="${product.name}" class="product-image">
                        <h2 class="product-name">${product.name}</h2>
                        <p class="product-price">${product.price}</p>
                        <div class="quantity-selector">
                            <button class="quantity-btn decrease">-</button>
                            <input type="number" class="quantity-input" value="1" min="1">
                            <button class="quantity-btn increase">+</button>
                        </div>
                        <button class="add-to-cart">Add to Cart</button>
                    `;
                    container.appendChild(productCard);
                });
                addQuantityButtonListeners();
                addCartFunctionality();
            })
            .catch(error => console.error("Error fetching search results:", error));
    });
});

function fetchProducts() {
    fetch("http://localhost:3000/all-products")
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".product-container");
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p class='no-results'>No products available.</p>";
                return;
            }

            data.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${product.image_url}" alt="${product.name}" class="product-image">
                    <h2 class="product-name">${product.name}</h2>
                    <p class="product-price">${product.price}</p>
                    <div class="quantity-selector">
                        <button class="quantity-btn decrease">-</button>
                        <input type="number" class="quantity-input" value="1" min="1">
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <button class="add-to-cart">Add to Cart</button>
                `;
                container.appendChild(productCard);
            });
            addQuantityButtonListeners();
            addCartFunctionality();
        })
        .catch(error => console.error("Error fetching products:", error));
}

function addCartFunctionality() {
    console.log("🛒 addCartFunctionality triggered!"); // Debugging log
    const buttons = document.querySelectorAll(".add-to-cart");

    if (buttons.length === 0) {
        console.log("⚠️ No add-to-cart buttons found!");
    }

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            console.log("🛒 Add to Cart button clicked!"); // Debugging log

            const productCard = this.closest(".product-card");
            const name = productCard.querySelector(".product-name").textContent;
            const price = productCard.querySelector(".product-price").textContent.replace("₹", "").trim();
            const quantity = parseInt(productCard.querySelector(".quantity-input").value);

            const orderData = {
                medicineName: name,
                quantity: quantity,
                price: parseFloat(price) * quantity, 
            };

            console.log("Sending order data:", orderData); // Debugging log before sending request

            fetch("http://localhost:3000/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data); // Debugging log after response
                if (data.success) {
                    alert("Added to Cart!");
                } else {
                    alert("✅ Order placed successfully");
                }
            })
            .catch(error => {
                console.error("Error placing order:", error);
                alert("Error adding to cart. Please check the server.");
            });
        });
    });

    console.log(`Attached add-to-cart event to ${buttons.length} buttons`);
}


function addQuantityButtonListeners() {
    document.querySelectorAll(".decrease").forEach(btn => {
        btn.addEventListener("click", function () {
            let input = this.nextElementSibling;
            if (input.value > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });
    });

    document.querySelectorAll(".increase").forEach(btn => {
        btn.addEventListener("click", function () {
            let input = this.previousElementSibling;
            input.value = parseInt(input.value) + 1;
        });
    });
}

function logout() {
    // Clear session storage or local storage
    localStorage.removeItem("user"); // If using localStorage for authentication
    sessionStorage.removeItem("user"); // If using sessionStorage

    // Optionally, clear cookies if using them for login sessions
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect to login page
    window.location.href = "/User/html/login.html";
}
