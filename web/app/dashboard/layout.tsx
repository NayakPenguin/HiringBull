import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — HiringBull",
  description: "Manage companies, subscribers, and platform analytics from the HiringBull admin panel.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
