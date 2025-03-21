function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const header = document.querySelector(".header");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");


    if (sidebar.style.left === "0px") 
        {
            sidebar.style.left = "-250px"; // Hide Sidebar
        header.classList.remove("fixed"); // Remove Fixed Position
        } else
        {
            sidebar.style.left = "0px"; // Show Sidebar
            header.classList.add("fixed"); // Make Header Fixed
        }
}






document.addEventListener("DOMContentLoaded", function () { 
    // Waits for the HTML document to be fully loaded before running the script.

    const banners = [
        "offer-banner.png",  // First image
        "offer-banner1.png", // Second image
        "offer-banner3.png"  // Third image
    ];
    // Array storing the image file paths for the offer banners.

    let currentIndex = 0;  
    // Variable to keep track of the currently displayed image index.

    const bannerImg = document.querySelector(".offer-banner .banner");  
    // Selects the image element inside the offer-banner div.

    const nextBtns = document.querySelectorAll(".offer-banner .next-btn");  
    // Selects both the left ("<") and right (">") navigation buttons.

    function changeBanner(next = true) {  
        // Function to change the banner when a navigation button is clicked.
        // 'next' determines the direction of change: 
        // true for forward (">"), false for backward ("<").

        bannerImg.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";  
        // Applies a transition effect for smooth sliding and fading.

        bannerImg.style.transform = next ? "translateX(-100%)" : "translateX(100%)";  
        // Moves the current image out of the screen to the left (-100%) if going forward,
        // or to the right (100%) if going backward.

        bannerImg.style.opacity = "0";  
        // Fades out the image.

        setTimeout(() => {  
            // Waits for the slide-out animation to complete before changing the image.

            currentIndex = next  
                ? (currentIndex + 1) % banners.length  
                : (currentIndex - 1 + banners.length) % banners.length;
            // Updates the index:  
            // If going forward, increment index (loop back if at the end).  
            // If going backward, decrement index (loop back if at the start).

            bannerImg.src = banners[currentIndex];  
            // Changes the image source to the new banner.

            bannerImg.style.transition = "none";  
            // Removes transition temporarily to reset position instantly.

            bannerImg.style.transform = next ? "translateX(100%)" : "translateX(-100%)";  
            // Moves the new image off-screen in the opposite direction 
            // so it can slide in smoothly.

            setTimeout(() => {  
                // Short delay before applying the transition again for a smooth slide-in effect.

                bannerImg.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";  
                // Re-enables the transition for a smooth slide-in animation.

                bannerImg.style.transform = "translateX(0)";  
                // Moves the new image back into the screen.

                bannerImg.style.opacity = "1";  
                // Fades the new image in.

            }, 50);  
            // The delay ensures the transition is applied after repositioning.

        }, 100);  
        // This timeout ensures the current image fully moves out before updating the source.
    }

    nextBtns[0].addEventListener("click", () => changeBanner(false));  
    // Adds event listener to the "<" button, moving to the previous banner when clicked.

    nextBtns[1].addEventListener("click", () => changeBanner(true));  
    // Adds event listener to the ">" button, moving to the next banner when clicked.
});



function fetchMedicines(category) {
    fetch(`http://localhost:3000/medicines/${category}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("product-container");
            container.innerHTML = ""; // Clear previous results

            if (data.length === 0) {
                container.innerHTML = "<p>No products available in this category.</p>";
                return;
            }

            data.forEach(medicine => {
                const productCard = `
                    <div class="product-card">
                        <img src="${medicine.image_url}" alt="${medicine.name}" class="product-image">
                        <h2 class="product-name">${medicine.name}</h2>
                        <p class="product-price">${medicine.price}</p>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `;
                container.innerHTML += productCard;
            });
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
            } else {
                resultHTML += "<p>No medicines found.</p>";
            }
            resultHTML += "</div>";
            document.getElementById("medicine-info").innerHTML = resultHTML;
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
            fetchProducts(); // Reload products if search is empty
            return;
        }

        fetch(`http://localhost:3000/search?q=${query}`)
            .then(response => response.json())
            .then(data => {
                // Remove only product cards, keep other elements
                document.querySelectorAll(".product-card").forEach(el => el.remove());

                if (data.length === 0) {
                    container.innerHTML += "<p class='no-results'>No products found.</p>";
                    return;
                }

                data.slice(0, 10).forEach(product => { // Limit to 10 results
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
            })
            .catch(error => console.error("Error fetching search results:", error));
    });
});


function fetchProducts() {
    fetch("http://localhost:3000/all-products") // Fetch products from backend
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(".product-container");
            container.innerHTML = ""; // Clear previous results

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
        })
        .catch(error => console.error("Error fetching products:", error));
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