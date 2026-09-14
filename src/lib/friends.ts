import { prisma } from "@/lib/prisma";

export async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ userId }, { friendId: userId }],
    },
  });
  return rows.map((r) => (r.userId === userId ? r.friendId : r.userId));
}

export async function areFriends(a: string, b: string) {
  const row = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { userId: a, friendId: b },
        { userId: b, friendId: a },
      ],
    },
  });
  return !!row;
}
