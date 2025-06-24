const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com" 
});

const db = admin.database();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to receive data from ESP32
app.post('/upload', (req, res) => {
  const data = req.body;

  console.log("📥 Received data:", data);

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server running on http://localhost:${PORT}/upload`);
});