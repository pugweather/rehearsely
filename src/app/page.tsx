import db from "./database";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";
import Pricing from "./components/home/Pricing";

export default async function Home() {

  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex flex-col flex-grow">
        <Hero />
        <Pricing />
      </main>
      <footer></footer>
    </div>
  );
}
