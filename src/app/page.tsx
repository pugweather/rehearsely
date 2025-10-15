import db from "./database";
import Hero from "./components/home/Hero";
import Pricing from "./components/home/Pricing";
import FAQ from "./components/home/FAQ";
import Footer from "./components/home/Footer";

export default async function Home() {

  return (
    <div className="h-screen overflow-y-scroll bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc]">
      <main>
        <Hero />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
