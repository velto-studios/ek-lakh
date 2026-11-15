"use client";

import { useEffect, useRef, useState } from "react";

import { media } from "@/lib/content";
import { pad2 } from "@/lib/format";

interface SceneImageProps {
  src: string;
  alt: string;
  number: number;
}

/**
 * A scene still with a designed stand-in. The dark numbered tile sits behind
 * the image, so it shows while the image loads and stays if the image is
 * missing: a broken-image icon never appears and the layout never shifts.
 */
export function SceneImage({ src, alt, number }: SceneImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // An image can fail before hydration attaches onError, so check once on mount.
  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="dot-tile absolute inset-0 flex items-center justify-center"
      >
        <span className="numeral text-[clamp(4rem,22vw,6.5rem)] font-bold leading-none text-white/25">
          {pad2(number)}
        </span>
      </div>
      {failed ? (
        <span className="sr-only">{alt}</span>
      ) : (
        // A plain <img>: these are static files that need no optimizer.
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={media.sceneSize.width}
          height={media.sceneSize.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover text-transparent"
        />
      )}
    </>
  );
}
