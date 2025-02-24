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