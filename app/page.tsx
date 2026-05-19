// Public landing page. Not the intake surface — the intake lives at
// /i/{token}. This page is what someone hitting the bare domain sees,
// which is mostly nobody, but it ships in operator voice in case they
// land here through a forwarded link or curiosity.
//
// Read-aloud test required on the verbatim copy below.

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-16">
      <div className="space-y-10">
        <header className="space-y-3">
          <h1 className="font-playfair text-5xl text-near">Aperture</h1>
          <p className="font-sans text-[9pt] uppercase tracking-wide text-ash">
            Purpose-built for SkyFire Energy
          </p>
        </header>

        <hr className="border-t border-silver" />

        <section className="space-y-4 text-[14px] leading-body text-charcoal">
          <p>
            This page is the public entry point for the Aperture intake tool.
            Invitations are sent directly by Joey Palomo to named
            participants — there is no self-serve sign-up.
          </p>
          <p>
            If you&rsquo;ve received an invitation link, the link is the only
            way in.
          </p>
        </section>
      </div>
    </main>
  );
}
