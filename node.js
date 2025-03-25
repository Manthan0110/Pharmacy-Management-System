const bcrypt = require("bcryptjs");

const plainPassword = "manthan"; // Change to your desired admin password
const hashedPassword = bcrypt.hashSync(plainPassword, 10);

console.log("Hashed Password:", hashedPassword);
