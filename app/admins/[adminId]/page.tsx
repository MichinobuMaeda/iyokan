import { doc, getDoc } from "firebase/firestore";
import { getServerApp } from "@/app/lib/firebase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface AdminData {
  email: string;
  valid: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  const { auth, db } = await getServerApp();
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  let admin: AdminData | null = null;
  let error: string | undefined;

  try {
    const adminDoc = await getDoc(doc(db, "admins", adminId));
    if (!adminDoc.exists()) {
      error = "Admin not found";
    } else {
      const data = adminDoc.data();
      admin = {
        email: String(data.email || ""),
        valid: Boolean(data.valid),
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : undefined,
      };
    }
  } catch (err) {
    console.error("Error fetching admin:", err);
    error = "Failed to load admin data";
  }

  if (error || !admin) {
    return (
      <main>
        <div className="column">
          <h2>Admin Details</h2>
          <p className="error">{error || "Admin not found"}</p>
          <Link href="/admins">← Back to admins list</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="column">
        <h2>Admin Details</h2>
        <div className="row">
          <strong>ID:</strong> {adminId}
        </div>
        <div className="row">
          <strong>Email:</strong> {admin.email}
        </div>
        <div className="row">
          <strong>Status:</strong> {admin.valid ? "Valid" : "Invalid"}
        </div>
        {admin.createdAt && (
          <div className="row">
            <strong>Created At:</strong> {admin.createdAt}
          </div>
        )}
      </div>
    </main>
  );
}
