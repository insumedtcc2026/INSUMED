import React from "react";
import '../../css/home/Banner.css';
import banner from '../../assets/home/Banner.png';
 
const Banner: React.FC = () => {
  return (
    <section className="bannercontainer">
      <img
        src={banner}
        alt="Banner Insumed"
        className="bannerhero"
        draggable={false}
      />
    </section>
  );
};
 
export default Banner;
 