"use client";

import { useState } from "react";

export function StayPhoto({ src, property }: { src: string; property: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className="aspect-[3/2] bg-cream flex items-center justify-center">
      {src && failedSrc !== src ? (
        // Local photos are already resized and compressed; unknown properties may use a remote URL.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={property}
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="px-6 text-center font-sans text-sm text-charcoal/70">
          <p>Photo unavailable</p>
          <p className="mt-1">See the property listing for photos.</p>
        </div>
      )}
    </div>
  );
}
