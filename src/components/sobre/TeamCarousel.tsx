import { useEffect, useRef } from 'react';
import '../../css/sobre/TeamCarousel.css';

import Lucas from '../../assets/sobre/Lucas.png';
import Kayki from '../../assets/sobre/Kayki.png';
import Isabelly from '../../assets/sobre/Isabelly.png';
import AnaClara from '../../assets/sobre/Ana-Clara.png';
import AnaLivia from '../../assets/sobre/Ana-Lívia.png';
import Sara from '../../assets/sobre/Sara.png';

interface TeamMember {
  id: number;
  image: string;
  alt: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    image: Lucas,
    alt: "Membro da equipe 1",
  },
  {
    id: 2,
    image: Kayki,
    alt: "Membro da equipe 2",
  },
  {
    id: 3,
    image: Isabelly,
    alt: "Membro da equipe 3",
  },
  {
    id: 4,
    image: AnaClara,
    alt: "Membro da equipe 4",
  },
  {
    id: 5,
    image: AnaLivia,
    alt: "Membro da equipe 5",
  },
  {
    id: 6,
    image: Sara,
    alt: "Membro da equipe 6",
  },
];

export default function TeamCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    let animationFrame: number;
    let position = 0;

    const speed = 0.6;

    const animate = () => {
      position -= speed;

      const firstCard = track.children[0] as HTMLElement;

      if (firstCard) {
        const firstCardWidth = firstCard.offsetWidth + 48;

        if (Math.abs(position) >= firstCardWidth) {
          track.appendChild(firstCard);
          position += firstCardWidth;
        }
      }

      track.style.transform = `translateX(${position}px)`;

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="team-section">
      <h2 className="team-title">Conheça nossa equipe</h2>

      <div className="carousel-wrapper">
        <div className="carousel-track" ref={trackRef}>
          {teamMembers.map((member) => (
            <div className="team-card" key={member.id}>
              <img src={member.image} alt={member.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}