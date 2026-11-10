import Image from "next/image";

const APPS = [
  {
    name: "Grab", logo: "grab-logo.png", logoWidth: 156, logoHeight: 60,
    photo: "grab-car.webp", position: "object-center",
    caption: "GrabCar at an airport pickup point.",
    alt: "White GrabCar taxis with green Grab branding waiting at an airport pickup point",
    service: "Choose GrabBike for a scooter, GrabCar for a car, or GrabFood for delivery.",
    source: "https://www.grab.com/id/en/pressdownload/",
    apple: "https://apps.apple.com/au/app/grab-food-delivery-taxi-ride/id647268330",
    google: "https://play.google.com/store/apps/details?id=com.grabtaxi.passenger",
  },
  {
    name: "Gojek", logo: "gojek-logo.svg", logoWidth: 112, logoHeight: 32,
    photo: "gojek-bike.webp", position: "object-center",
    caption: "Scooter taxi in Indonesia.",
    alt: "Gojek GoRide driver and helmeted passenger seated on a white scooter at a pickup point",
    service: "Choose GoRide for a scooter, GoCar for a car, or GoFood for delivery.",
    source: "https://www.gojek.com/en-id/goride",
    apple: "https://apps.apple.com/au/app/gojek/id944875099",
    google: "https://play.google.com/store/apps/details?id=com.gojek.app",
  },
];

export function BaliRideApps() {
  return (
    <div className="mt-8 grid sm:grid-cols-2 gap-8">
      {APPS.map((app) => (
        <article key={app.name} className="min-w-0">
          <figure>
            <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-cream">
              <Image src={`/photos/bali-guide/${app.photo}`} alt={app.alt} fill
                sizes="(min-width: 1280px) 440px, (min-width: 640px) 45vw, 100vw"
                className={`object-cover ${app.position}`} />
            </div>
            <figcaption className="font-sans text-xs text-charcoal/65 mt-2">
              {app.caption} Photo: <a href={app.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{app.name}</a>.
            </figcaption>
          </figure>
          <div className="flex items-center gap-4 mt-5">
            <h3 className="sr-only">Download {app.name}</h3>
            <div className={`h-14 flex items-center ${app.name === "Gojek" ? "bg-charcoal rounded-sm px-4" : ""}`}>
              <Image src={`/photos/bali-guide/${app.logo}`} alt={`${app.name} logo`} width={app.logoWidth} height={app.logoHeight} unoptimized className="h-8 w-auto max-w-[140px]" />
            </div>
          </div>
          <p className="font-sans text-sm text-charcoal/75 leading-relaxed mt-3 mb-5">{app.service}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={app.apple} target="_blank" rel="noopener noreferrer" aria-label={`Download ${app.name} on the App Store`} className="inline-flex min-h-12 items-center rounded-sm transition-opacity hover:opacity-80">
              <Image src="/photos/bali-guide/app-store.png" alt="Download on the App Store" width={338} height={100} className="h-11 w-auto" unoptimized />
            </a>
            <a href={app.google} target="_blank" rel="noopener noreferrer" aria-label={`Get ${app.name} on Google Play`} className="inline-flex min-h-12 items-center rounded-sm transition-opacity hover:opacity-80">
              <Image src="/photos/bali-guide/google-play.png" alt="Get it on Google Play" width={338} height={100} className="h-11 w-auto" unoptimized />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
