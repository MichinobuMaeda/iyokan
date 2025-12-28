import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "API_KEY_HERE",
  authDomain: "iyokan.firebaseapp.com",
  projectId: "iyokan",
  storageBucket: "iyokan.firebasestorage.app",
  messagingSenderId: "328244279018",
  appId: "1:328244279018:web:c81f3c5af6ea7558e9c993",
  measurementId: "G-D3YDGP1KER",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

console.log(process.env.NODE_ENV);

if (["development", "test"].includes(process.env.NODE_ENV)) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}

export { app, auth };
