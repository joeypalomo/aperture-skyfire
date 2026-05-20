// Co-mark footer — Step 9. Aperture is built BY eCommerce Inc. FOR
// SkyFire Energy. Both marks sit quiet and subordinate to the
// Aperture hero lockup (BrandHeader) above.

export function BrandFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-silver pt-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-ash">
        <span>Built by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/ecommerce-inc.png"
          alt="eCommerce Inc."
          width={95}
          height={20}
          className="h-5 w-auto"
        />
        <span aria-hidden="true" className="text-silver">
          ·
        </span>
        <span>for</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/branding/skyfire.png"
          alt="SkyFire Energy"
          width={116}
          height={26}
          className="h-[26px] w-auto"
        />
      </div>
    </footer>
  );
}
