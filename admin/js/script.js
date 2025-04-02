document.addEventListener("DOMContentLoaded", function () {
    console.log("Admin Panel Loaded ✅");

    function showSection(sectionId) {
        document.querySelectorAll(".section").forEach(section => {
            section.style.display = "none";
        });

        document.getElementById(sectionId).style.display = "block";
    }

    document.querySelectorAll(".sidebar a").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            showSection(this.getAttribute("data-section"));
        });
    });

    showSection("dashboard");
    fetchUsers();
    fetchProducts();

    // ✅ LOGOUT FUNCTIONALITY
        document.getElementById("logoutBtn").addEventListener("click", function () {
            localStorage.removeItem("authToken"); // Remove stored token (if used)
            sessionStorage.clear(); // Clear session data
        window.location.href = "/user/html/login.html"; // Redirect to login page
});
});



// ✅ FETCH USERS
function fetchUsers() {
    fetch('http://localhost:3000/admin/users')
        .then(res => res.json())
        .then(data => {
            let tableBody = document.getElementById("userTableBody");
            tableBody.innerHTML = "";
            data.forEach(user => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.dob}</td>
                        <td>${user.role}</td>
                        <td>
                            <button onclick="editUser(${user.id}, '${user.full_name}', '${user.email}', '${user.dob}', '${user.role}')">✏️ Edit</button>
                            <button onclick="deleteUser(${user.id})">🗑️ Delete</button>
                        </td>
                    </tr>
                `;
            });
        });
}


// ✅ ADD USER
function addUser() {
    const full_name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const dob = document.getElementById("userDOB").value;
    const password = document.getElementById("userPassword").value;
    const role = document.getElementById("userRole").value;

    if (!full_name || !email || !dob || !password || !role) {
        alert("⚠️ All fields are required!");
        return;
    }

    fetch("http://localhost:3000/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, dob, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("❌ Error: " + data.error);
        } else {
            alert("✅ User added successfully!");
            fetchUsers();
            hideUserForm();
        }
    })
    .catch(error => console.error("❌ Fetch error:", error));
}



// ✅ EDIT USER
function editUser(id, full_name, email, dob, role) {
    const newName = prompt("Enter new full name:", full_name);
    const newEmail = prompt("Enter new email:", email);
    const newDOB = prompt("Enter new Date of Birth (YYYY-MM-DD):", dob);
    const newRole = prompt("Enter new role (admin/user):", role);

    if (!newName || !newEmail || !newDOB || !newRole) {
        alert("⚠️ All fields are required!");
        return;
    }

    fetch(`http://localhost:3000/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: newName, email: newEmail, dob: newDOB, role: newRole })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("❌ Error: " + data.error);
        } else {
            alert("✅ User updated successfully!");
            fetchUsers(); // Refresh users list
        }
    })
    .catch(error => console.error("❌ Fetch error:", error));
}


// ✅ DELETE USER
function deleteUser(userId) {

    const confirmDelete = confirm("Are you sure you want to delete this user?");
    
    if (!confirmDelete) return; // If the user cancels, do nothing

    fetch(`http://localhost:3000/admin/users/${userId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("❌ Error:", data.error);
        } else {
            console.log("✅", data.message);
            fetchUsers(); // Refresh user list after deletion
        }
    })
    .catch(error => console.error("❌ Fetch error:", error));
}



let currentPage = 1;

function fetchProducts() {
    let searchInput = document.getElementById("searchInput").value.trim();
    let searchQuery = searchInput ? searchInput.charAt(0) : "";  // ✅ Only first letter

    let url = `http://localhost:3000/admin/products?page=${currentPage}`;
    if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    console.log("Fetching:", url);  // ✅ Debug API Call

    fetch(url)
        .then(res => res.json())
        .then(data => {
            let tableBody = document.getElementById("productTableBody");
            tableBody.innerHTML = "";

            if (data.products.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4">No products found.</td></tr>`;
                return;
            }

            data.products.forEach(product => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.Name}</td>
                        <td>${product.Price}</td>
                        <td>
                            <button onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById("pageNumber").innerText = `Page ${data.currentPage} of ${data.totalPages}`;
            document.getElementById("prevPage").disabled = data.currentPage === 1;
            document.getElementById("nextPage").disabled = data.currentPage === data.totalPages;
        })
        .catch(error => console.error("❌ Fetch error:", error));
}

// ✅ Update search on input change
document.getElementById("searchInput").addEventListener("input", function () {
    currentPage = 1;
    fetchProducts();
});

// ✅ Pagination Handling
function changePage(step) {
    currentPage += step;
    fetchProducts();
}

// ✅ Initialize
document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
});






function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const imageUrl = document.getElementById("productImageUrl").value.trim();

    if (!name || !price || !imageUrl) {
        alert("❌ Name, price, and image URL cannot be empty!");
        return;
    }

    fetch("http://localhost:3000/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, image_url: imageUrl })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("❌ Error: " + data.error);
            return;
        }

        alert("✅ " + data.message); // ✅ Show success message
        fetchProducts(); // ✅ Refresh product list
        hideProductForm(); // ✅ Hide form after adding
    })
    .catch(error => {
        console.error("❌ Fetch error:", error);
        alert("❌ Failed to add product.");
    });
}


// // ✅ EDIT PRODUCT
// function editProduct(id, name, price) {
//     const newName = prompt("Enter new product name:", name);
//     const newPrice = prompt("Enter new price:", price);

//     fetch(`/admin/products/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: newName, price: newPrice })
//     })
//     .then(() => fetchProducts());
// }

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return; // ✅ Confirmation before deleting

    fetch(`http://localhost:3000/admin/products/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert("❌ Error: " + data.error);
                return;
            }

            alert("✅ " + data.message); // ✅ Show success message
            fetchProducts(); // ✅ Refresh product list
        })
        .catch(error => {
            console.error("❌ Fetch error:", error);
            alert("❌ Failed to delete product.");
        });
}


// ✅ SHOW/HIDE FORMS
function showUserForm() { document.getElementById("userForm").style.display = "block"; }
function hideUserForm() { document.getElementById("userForm").style.display = "none"; }
function showProductForm() { document.getElementById("productForm").style.display = "block"; }
function hideProductForm() { document.getElementById("productForm").style.display = "none"; }



document.addEventListener("DOMContentLoaded", function () {
    loadOrders();
});

function loadOrders() {
    fetch('http://localhost:3000/admin/getOrders')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("orderTableBody");
            tableBody.innerHTML = ""; // Clear table before adding new rows

            data.forEach(order => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.medicine_name}</td>
                    <td>${order.quantity}</td>
                    <td>₹${order.price}</td>
                    <td>
                        <select onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deleteOrder(${order.id})">❌ Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching orders:", error));
}

function updateOrderStatus(orderId, newStatus) {
    fetch(`http://127.0.0.1:3000/update-order-status/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchOrders();  // Refresh the order list
    })
    .catch(error => console.error('Error updating order status:', error));
}


function deleteOrder(orderId) {

    if (!confirm("Are you sure you want to delete this order?")) return; // Confirmation before deleting

    fetch(`http://127.0.0.1:3000/delete-order/${orderId}`, {
        method: 'DELETE'
    })
    .then(response => response.json()) // Expecting a JSON response
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error('Error deleting order:', error));

    // Reload orders after deletion 
    fetchOrders();
}


