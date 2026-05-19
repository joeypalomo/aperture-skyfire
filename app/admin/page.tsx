// Admin panel placeholder. Step 3 wires magic-link auth + the invite-link
// generator; later steps add the cohort dashboard, per-session views,
// transcript search, and the "force-expire" RPC controls.

export default function AdminPlaceholder() {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-16">
      <div className="space-y-6">
        <h1 className="font-playfair text-4xl text-near">Aperture admin</h1>
        <p className="text-[14px] leading-body text-charcoal">
          Admin surface ships in Step 3.
        </p>
      </div>
    </main>
  );
}
