const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Load environment variables
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'your-project-id';
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://your-project-default-rtdb.firebaseio.com'; 
const FIREBASE_CREDENTIAL_PATH = process.env.FIREBASE_CREDENTIAL_PATH || './serviceAccountKey.json';

// Try loading secret file or local JSON key
let serviceAccount;
try {
  // Attempt to load secret file (used on Render, etc.)
  serviceAccount = require('/etc/secrets/serviceAccountKey.json');
} catch (err) {
  try {
    // Fallback to local file (used during development)
    serviceAccount = require('./serviceAccountKey.json');
  } catch (err) {
    console.error("❌ Firebase credentials not found!");
    console.error("👉 Make sure you have set up serviceAccountKey.json or use environment variables.");
    process.exit(1);
  }
}

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL
});

const db = admin.database();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to receive encrypted data from ESP32
app.post('/upload', (req, res) => {
  const data = req.body;

  console.log("📥 Received raw data:", data);

  // Save to Firebase under /gps_tracker_data/deviceId/
  const ref = db.ref('gps_tracker_data').child(data.device);
  ref.push({
    encryptedData: data.encrypted_data,
    timestamp: data.timestamp,
    raw: data
  });

  console.log("✅ Data saved to Firebase");
  res.status(200).send("OK");
});

// Optional: Add a test route
app.get('/', (req, res) => {
  res.send("ESP32 GPS/GSM Tracker Proxy Server Running 🚀");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server running on http://localhost:${PORT}/upload`);
});
