const QUERY = encodeURIComponent("Stone Villas Uluwatu, Jl. Raya Uluwatu, Pecatu, Bali");

/** Google and Apple Maps directions to the venue. */
export function MapLinks({ className = "" }: { className?: string }) {
  const link = "text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent";
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <a href={`https://www.google.com/maps/search/?api=1&query=${QUERY}`} target="_blank" rel="noopener noreferrer" className={link}>
        Google Maps
      </a>
      <span className="text-charcoal/30 mx-2">/</span>
      <a href={`https://maps.apple.com/?q=${QUERY}`} target="_blank" rel="noopener noreferrer" className={link}>
        Apple Maps
      </a>
    </span>
  );
}
