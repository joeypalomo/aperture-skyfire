// Admin layout. Middleware has already verified the auth session by
// the time this renders for /admin/* (except /admin/login which uses
// the root layout). Adds a header and a small sign-out link.

import { signOut } from "./_actions/sign-out";
import { getAuthenticatedClient } from "@/lib/supabase/server-cookies";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getAuthenticatedClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-silver">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="space-y-0.5">
            <h1 className="font-playfair text-2xl text-near">
              Aperture admin
            </h1>
            <p className="font-sans text-[9pt] uppercase tracking-wide text-ash">
              Purpose-built for SkyFire Energy
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-4 text-[12px] text-ash">
              <span>{user.email}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="underline hover:text-burnt"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
