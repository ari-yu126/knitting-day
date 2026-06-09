import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

export default function PostsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col font-sans text-font">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
