import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  try {
    await fetch(`${API_URL}/api/company/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_user_id: userId,
        business_name: user?.firstName
          ? `${user.firstName}'s Business`
          : "My Business",
      }),
    });
  } catch (err) {
    console.error("Company sync failed:", err);
  }

  return <>{children}</>;
}