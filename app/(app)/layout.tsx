import Sidebar from "@/components/Sidebar/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-teal-400 via-teal-300 to-emerald-200">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
