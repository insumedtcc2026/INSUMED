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
      <section className="homehome-section">
        <CareSection />
      </section>
      <section className="homehome-section">
        <AppFeatures />
      </section>
      <section className="homehome-section">
        <ExpansionMap />
      </section>
      <section className="homehome-section">
        <Footer />
      </section>
    </main>
  );
}