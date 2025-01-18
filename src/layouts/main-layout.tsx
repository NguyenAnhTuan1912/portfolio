// Import components
import Header from "src/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex flex-col w-full">
      <Header />
      {children}
    </main>
  );
}
