// Shared Aperture brand lockup — Step 9.
//
// The Aperture logo (camera-aperture mark + wordmark) is the hero of
// every surface. "Intelligence Agent" is the product class; the
// SkyFire engagement line sits beneath on the hero variant. The
// eCommerce Inc. maker mark and SkyFire co-mark live in BrandFooter.

interface BrandHeaderProps {
  /** "hero" — large, centered (welcome + landing pages).
   *  "compact" — small, left-aligned (chat header). */
  variant?: "hero" | "compact";
  className?: string;
}

export function BrandHeader({
  variant = "hero",
  className = "",
}: BrandHeaderProps) {
  const hero = variant === "hero";
  return (
    <div
      className={`flex flex-col ${
        hero ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/branding/aperture.png"
        alt="Aperture"
        width={hero ? 288 : 133}
        height={hero ? 78 : 36}
        className={hero ? "h-[78px] w-auto" : "h-9 w-auto"}
      />
      <p
        className={`font-sans uppercase text-ash ${
          hero
            ? "mt-3 text-[10px] tracking-[0.28em]"
            : "mt-2 text-[8.5px] tracking-[0.24em]"
        }`}
      >
        Intelligence Agent
      </p>
      {hero && (
        <p className="mt-1.5 font-sans text-[13px] leading-snug text-ash">
          Purpose-built for SkyFire Energy
        </p>
      )}
    </div>
  );
}
