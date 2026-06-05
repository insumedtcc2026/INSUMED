
import '../../css/sobre/BannerAbout.css';

import BannerImage from '../../assets/sobre/about-banner.png';

export default function BannerAbout() {
  return (
    <section className="banner-about">
      <img src={BannerImage} alt="Banner Sobre" />
    </section>
  );
}