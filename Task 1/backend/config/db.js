const mongoose = require('mongoose');

// Only set custom DNS on Windows if needed, never in cloud/Render
if (process.platform === 'win32' && !process.env.RENDER) {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veloop_tap_earn';
  
  try {
    console.log(`[MongoDB Connecting] to: ${mongoURI.split('@')[1] ? 'cluster0 (Atlas)' : 'localhost'}`);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Do NOT exit process so Render web service remains up and can retry
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
