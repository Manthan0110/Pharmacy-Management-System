document.getElementById("logout").addEventListener("click", function() {
    alert("Logging out...");
    window.location.href = "../login.html"; // Redirect to login page
});

document.getElementById("dashboard-link").addEventListener("click", function() {
    document.getElementById("content").innerHTML = "<h2>Dashboard Overview</h2><p>Show total users, orders, sales...</p>";
});

document.getElementById("users-link").addEventListener("click", function() {
    fetch("http://localhost:3000/admin/users")
        .then(response => response.json())
        .then(data => {
            let userList = "<h2>Users List</h2><ul>";
            data.forEach(user => {
                userList += `<li>${user.full_name} - ${user.email}</li>`;
            });
            userList += "</ul>";
            document.getElementById("content").innerHTML = userList;
        })
        .catch(error => console.error("Error:", error));
});

document.getElementById("products-link").addEventListener("click", function() {
    document.getElementById("content").innerHTML = "<h2>Product Management</h2><p>Manage medicines here...</p>";
});

document.getElementById("orders-link").addEventListener("click", function() {
    document.getElementById("content").innerHTML = "<h2>Orders Management</h2><p>View and update orders...</p>";
});
