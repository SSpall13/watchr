import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { FriendsClient } from "@/components/FriendsClient";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const me = await prisma.user.findUnique({ where: { id: userId } });

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userId }, { friendId: userId }] },
    include: {
      user: { select: { id: true, name: true, email: true, currentlyWatching: true } },
      friend: { select: { id: true, name: true, email: true, currentlyWatching: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends = [];
  const incoming = [];
  const outgoing = [];
  const connected = new Set<string>([userId]);

  for (const f of friendships) {
    connected.add(f.userId);
    connected.add(f.friendId);
    if (f.status === "accepted") {
      friends.push({
        friendshipId: f.id,
        user: f.userId === userId ? f.friend : f.user,
      });
    } else if (f.status === "pending") {
      if (f.friendId === userId) {
        incoming.push({ friendshipId: f.id, user: f.user });
      } else {
        outgoing.push({ friendshipId: f.id, user: f.friend });
      }
    }
  }

  const suggestions = await prisma.user.findMany({
    where: { id: { notIn: [...connected] } },
    select: { id: true, name: true, email: true, currentlyWatching: true },
    take: 20,
  });

  return (
    <AppShell userName={me?.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Friends</h1>
          <p className="mt-1 text-sm text-violet-200/60">
            Add friends to see what they&apos;re watching on your{" "}
            <Link href="/feed" className="text-brand-300 hover:underline">
              feed
            </Link>
          </p>
        </div>
        <FriendsClient
          friends={friends}
          incoming={incoming}
          outgoing={outgoing}
          suggestions={suggestions}
        />
      </div>
    </AppShell>
  );
}
