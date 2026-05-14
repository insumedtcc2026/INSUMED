import '../css/Banner.css';

interface BannerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
}

export default function Banner({
  imageUrl,
  alt = 'Banner promocional',
  className = '',
}: BannerProps) {
  return (
    <section className={`banner ${className}`}>
      <div className="banner-container">
        <img
          src={imageUrl}
          alt={alt}
          className="banner-image"
        />
      </div>
    </section>
  );
}