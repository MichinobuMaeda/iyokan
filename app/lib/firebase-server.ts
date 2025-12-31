import { initializeServerApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { cookies, headers } from "next/headers";
import { firebaseConfig } from "./firebase";

export async function getServerApp(): Promise<{
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  functions: ReturnType<typeof getFunctions>;
}> {
  const cookieStore = await cookies();
  const authIdToken = cookieStore.get("__session")?.value;
  console.log("Auth ID Token:", authIdToken);
  const headersObj = await headers();

  const app = initializeServerApp(firebaseConfig, {
    authIdToken,
    releaseOnDeref: headersObj,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);
  functions.region = "asia-northeast1";

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    console.log("Connecting to Firebase emulators...");
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log("Connected to Firebase emulators");
  }

  await auth.authStateReady();

  return { auth, db, functions };
}
