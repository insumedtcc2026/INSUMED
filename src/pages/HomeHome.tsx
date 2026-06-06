import { useEffect, useRef } from "react";

import Header from "../components/home/Header";
import Banner from "../components/home/Banner";
import CareSection from "../components/home/CareSection";
import AppFeatures from "../components/home/AppFeatures";
import ExpansionMap from "../components/home/ExpansionMap";
import Footer from "../components/home/Footer";

import "../css/home/HomeHome.css";

export default function App() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    let activeIndex = 0;
    let isAnimating = false;

    const updateActiveIndex = (scrollY = window.scrollY) => {
      let nextIndex = 0;

      sections.forEach((section, index) => {
        if (section.offsetTop <= scrollY + 120) {
          nextIndex = index;
        }
      });

      activeIndex = nextIndex;
    };

    const handleScroll = () => {
      updateActiveIndex();
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10 || isAnimating) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(
        Math.max(activeIndex + direction, 0),
        sections.length - 1,
      );

      if (nextIndex === activeIndex) return;

      event.preventDefault();
      activeIndex = nextIndex;
      isAnimating = true;

      sections[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.setTimeout(() => {
        isAnimating = false;
      }, 1500);
    };

    updateActiveIndex();

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="homehome-page">
      <Header />
      <section ref={(el) => { sectionRefs.current[0] = el; }} className="homehome-section">
        <Banner />
      </section>
      <section ref={(el) => { sectionRefs.current[1] = el; }} className="homehome-section">
        <CareSection />
      </section>
      <section ref={(el) => { sectionRefs.current[2] = el; }} className="homehome-section">
        <AppFeatures />
      </section>
      <section ref={(el) => { sectionRefs.current[3] = el; }} className="homehome-section">
        <ExpansionMap />
      </section>
      <section ref={(el) => { sectionRefs.current[4] = el; }} className="homehome-section">
        <Footer />
      </section>
    </main>
  );
}