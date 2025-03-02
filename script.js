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







//API Call for Searching Data

let debounceTimer; // Variable to store debounce timer

const API_KEY = "AyMFqeAAktGm1LmxbWHKcECkUESEMc2ODh9yZWF0"; // Replace with your actual OpenFDA API key

// Function to fetch medicine details from OpenFDA API
async function fetchMedicineData(medicineName) {
    try {
        if (medicineName.length < 3) return; // Only search if at least 3 characters are entered

        const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${medicineName}&limit=1&api_key=${API_KEY}`);

        console.log("API Response Status:", response.status); // Log status code

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`); // Handle API errors
        }

        const data = await response.json(); // Parse JSON response
        console.log("API Response Data:", data); // Log full response

        if (data.results && data.results.length > 0) {
            displayMedicineData(data.results[0]); // Call function to update UI
        } else {
            document.getElementById("medicine-info").innerHTML = "<p>No results found</p>"; // Show message if no data
        }
    } catch (error) {
        console.error("Error fetching medicine data:", error); // Log errors
    }
}


// Function to display fetched medicine details on the webpage
function displayMedicineData(medicine) {
    const medicineContainer = document.getElementById("medicine-info"); // Get container element

    medicineContainer.innerHTML = `
        <h3>${medicine.openfda.brand_name ? medicine.openfda.brand_name.join(", ") : "Unknown Name"}</h3>
        <p><strong>Generic Name:</strong> ${medicine.openfda.generic_name ? medicine.openfda.generic_name.join(", ") : "N/A"}</p>
        <p><strong>Manufacturer:</strong> ${medicine.openfda.manufacturer_name ? medicine.openfda.manufacturer_name.join(", ") : "N/A"}</p>
        <p><strong>Purpose:</strong> ${medicine.purpose ? medicine.purpose.join(", ") : "Not specified"}</p>
        <p><strong>Warnings:</strong> ${medicine.warnings ? medicine.warnings.join(". ") : "No warnings available"}</p>
    `; // Dynamically insert API data into the HTML
}

// Event listener for input field (with debounce)
document.getElementById("Search").addEventListener("input", function () {
    clearTimeout(debounceTimer); // Clear previous timer
    const searchInput = this.value.trim(); // Get user input

    debounceTimer = setTimeout(() => {
        fetchMedicineData(searchInput); // Fetch data after delay
    }, 500); // Delay of 500ms to prevent excessive API calls
});



document.addEventListener("DOMContentLoaded", function () {
    const banners = [
        "offer-banner.png",  // First image
        "offer-banner1.png", // Second image
        "offer-banner3.png"  // Third image
    ];

    let currentIndex = 0;
    const bannerImg = document.querySelector(".offer-banner .banner");
    const nextBtns = document.querySelectorAll(".offer-banner .next-btn");

    function changeBanner(next = true) {
        bannerImg.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";

        // Slide effect direction
        bannerImg.style.transform = next ? "translateX(-100%)" : "translateX(100%)";
        bannerImg.style.opacity = "0";

        setTimeout(() => {
            currentIndex = next
                ? (currentIndex + 1) % banners.length
                : (currentIndex - 1 + banners.length) % banners.length;

            bannerImg.src = banners[currentIndex];

            // Reset position for smooth transition
            bannerImg.style.transition = "none";
            bannerImg.style.transform = next ? "translateX(100%)" : "translateX(-100%)";

            setTimeout(() => {
                bannerImg.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";
                bannerImg.style.transform = "translateX(0)";
                bannerImg.style.opacity = "1";
            }, 50);
        }, 100);
    }

    nextBtns[0].addEventListener("click", () => changeBanner(false)); // "<" button
    nextBtns[1].addEventListener("click", () => changeBanner(true));  // ">" button
});
