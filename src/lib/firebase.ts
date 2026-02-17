import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

import { firebaseConfig } from "./firebase-config";

export const initFirebase = () => {
  console.info("Initializing Firebase...");
  const isEmulator = ["localhost", "127.0.0.1"].includes(location.hostname);

  const app =
    getApps().length === 0
      ? initializeApp(
          isEmulator
            ? {
                ...firebaseConfig,
                authDomain: "localhost",
              }
            : firebaseConfig
        )
      : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  const storage = getStorage(app);
  functions.region = "asia-northeast1";

  if (isEmulator) {
    console.log("Connecting to Firebase emulators...");
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    console.log("Connected to Firebase emulators");
  }

  return { auth, db, functions, storage };
};

const { auth, db, functions, storage } = initFirebase();

export { auth, db, functions, storage };
