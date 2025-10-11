import db from "./database";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Pricing from "./components/home/Pricing";
import FAQ from "./components/home/FAQ";

export default async function Home() {

  return (
    <div className="h-screen overflow-y-scroll bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc]">
      <Navbar />
      <main>
        <Hero />
        <Pricing />
        <FAQ />
      </main>
      <footer className="bg-black/10 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-700">
          <p>&copy; 2024 Rehearsely. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
