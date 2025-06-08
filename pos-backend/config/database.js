const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../system.config.json'), 'utf8'));
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        process.exit();
    }
}

module.exports = connectDB;