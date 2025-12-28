"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return loading ? (
    <main>
      <div>Loading...</div>
    </main>
  ) : (
    <main>
      <div className="column"></div>
    </main>
  );
}
