import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const displayName = session.name?.trim() || session.email;
  const initial = (session.name?.trim()?.[0] ?? session.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4 px-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {session.image ? (
                <img
                  src={session.image}
                  alt={displayName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
                  width={36}
                  height={36}
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground ring-2 ring-border"
                  aria-hidden
                >
                  {initial}
                </div>
              )}
              <span className="hidden text-sm text-muted-foreground sm:inline">{displayName}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {session.image ? (
                  <img
                    src={session.image}
                    alt={displayName}
                    className="h-14 w-14 rounded-full object-cover"
                    width={56}
                    height={56}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {initial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{displayName}</p>
                  <p className="text-sm text-muted-foreground truncate">{session.email}</p>
                </div>
              </div>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{session.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{session.name || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are signed in. Use the sidebar or navigation to manage your to-do list.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}