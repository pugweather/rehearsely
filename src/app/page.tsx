import db from "./database";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/home/Hero";

export default async function Home() {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-col flex-grow">
        <Hero />
      </main>
      <footer></footer>
    </div>
  );
}
