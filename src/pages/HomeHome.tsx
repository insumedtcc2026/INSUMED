import Header from "../components/home/Header";
import Banner from "../components/home/Banner";
import CareSection from "../components/home/CareSection";
import AppFeatures from "../components/home/AppFeatures";
import ExpansionMap from "../components/home/ExpansionMap";
import Footer from "../components/home/Footer";
import "../css/home/HomeHome.css";

export default function App() {
  return (
    <main className="homehome-page">
      <Header />
      <section className="homehome-section">
        <Banner />
      </section>
      {/* destinos dos links do header (rolagem suave); tabIndex para receber o foco */}
      <section id="sobre" tabIndex={-1} aria-label="Sobre o INSUMED" className="homehome-section homehome-ancora">
        <CareSection />
      </section>
      <section id="aplicativo" tabIndex={-1} aria-label="Aplicativo" className="homehome-section homehome-ancora">
        <AppFeatures />
      </section>
      <section id="onde-estamos" tabIndex={-1} aria-label="Onde estamos" className="homehome-section homehome-ancora">
        <ExpansionMap />
      </section>
      <section className="homehome-section">
        <Footer />
      </section>
    </main>
  );
}