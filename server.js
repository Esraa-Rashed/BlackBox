const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Load environment variables
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'your-project-id';
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://your-project-default-rtdb.firebaseio.com'; 
const FIREBASE_CREDENTIAL_PATH = process.env.FIREBASE_CREDENTIAL_PATH || './serviceAccountKey.json';

// Try loading secret file or local JSON key
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth', 
  token_uri: 'https://oauth2.googleapis.com/token', 
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs', 
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

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
