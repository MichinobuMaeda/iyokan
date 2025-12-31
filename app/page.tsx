import { collection, getDocs } from "firebase/firestore";
import { getServerApp } from "@/app/lib/firebase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Admin {
  id: string;
  email: string;
  valid: boolean;
}

export default async function Home() {
  const { auth, db } = await getServerApp();
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  const admins: Admin[] = [];
  let error: string | undefined;

  try {
    const querySnapshot = await getDocs(collection(db, "admins"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      admins.push({
        id: doc.id,
        email: String(data.email || ""),
        valid: Boolean(data.valid),
      });
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    error = "Failed to load admins";
  }

  return (
    <main>
      <div className="column">
        <h2>Admins</h2>
        {error ? (
          <p className="error">{error}</p>
        ) : admins.length === 0 ? (
          <p>No admins found</p>
        ) : (
          <ul>
            {admins.map((admin) => (
              <li key={admin.id}>
                <Link href={`/admins/${admin.id}`}>
                  {admin.email} {!admin.valid && "(Invalid)"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
