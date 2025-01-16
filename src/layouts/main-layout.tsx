// Import components
import Header from "src/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col w-full h-screen">
      <Header />
      {children}
    </main>
  );
}
