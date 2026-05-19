// Invite token route. Wired in Step 3 (token validation + welcome screen)
// and Step 4 (conversation engine). Placeholder for Step 2 so the build
// succeeds with the route declared.

export default function IntakeTokenPlaceholder() {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-16">
      <div className="space-y-6">
        <h1 className="font-playfair text-4xl text-near">Aperture</h1>
        <p className="text-[14px] leading-body text-charcoal">
          Intake routing is being prepared. Reach out to Joey directly if
          you&rsquo;re trying to start a session.
        </p>
      </div>
    </main>
  );
}
