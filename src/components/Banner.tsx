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
    <section className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <img
          src={imageUrl}
          alt={alt}
          className="h-auto w-full object-cover"
        />
      </div>
    </section>
  );
}
