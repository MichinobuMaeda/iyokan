import { collection, getDocs } from "firebase/firestore";
import { getServerApp } from "@/app/lib/firebase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Admin {
  id: string;
  email: string;
  name: string;
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
        name: String(data.name || ""),
        valid: Boolean(data.valid),
      });
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    error = "Failed to load admins";
  }

  return (
    <main style={{ maxWidth: "32rem", width: "100%" }}>
      <div className="column">
        <h2>Admins</h2>
        {error ? (
          <p className="error">{error}</p>
        ) : admins.length === 0 ? (
          <p>No admins found</p>
        ) : (
          <>
            <Link href="/admins">Add admin</Link>
            <table style={{ borderCollapse: "collapse" }}>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  style={{ background: admin.valid ? "transparent" : "#ccc" }}
                >
                  <td style={{ padding: "0.125rem 0.5rem" }}>
                    <Link href={`/admins/${admin.id}`}>{admin.email}</Link>
                  </td>
                  <td style={{ padding: "0.125rem 0.5rem" }}>{admin.name}</td>
                </tr>
              ))}
            </table>
          </>
        )}
      </div>
    </main>
  );
}
