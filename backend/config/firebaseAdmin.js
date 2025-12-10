const admin = require("firebase-admin");

if (!admin.apps.length) {
  try {
    // START: Check for service account
    // Ideally, provided via environment variable as a JSON string or path
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // If it's a JSON string
      if (process.env.FIREBASE_SERVICE_ACCOUNT.startsWith("{")) {
        let raw = process.env.FIREBASE_SERVICE_ACCOUNT;
        raw = raw.replace(/\\n/g, "\n");
        serviceAccount = JSON.parse(raw);
      } else {
        // Assume it's a path
        serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
      }
    } else {
      // Fallback: look for local file (for dev)
      // You must download this from Firebase Console -> Project Settings -> Service Accounts
      try {
        serviceAccount = require("../serviceAccountKey.json");
      } catch (e) {
        console.warn(
          "⚠️ No serviceAccountKey.json found and FIREBASE_SERVICE_ACCOUNT not set."
        );
        console.warn("Firebase Admin SDK will fail to verify tokens.");
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin Initialized");
    }
  } catch (error) {
    console.error("❌ Firebase Admin Initialization Error:", error);
  }
}

module.exports = admin;
