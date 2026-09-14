import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          currentlyWatching: true,
        },
      },
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          currentlyWatching: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends = [];
  const incoming = [];
  const outgoing = [];

  for (const f of friendships) {
    if (f.status === "accepted") {
      const other = f.userId === userId ? f.friend : f.user;
      friends.push({ friendshipId: f.id, user: other });
    } else if (f.status === "pending") {
      if (f.friendId === userId) {
        incoming.push({ friendshipId: f.id, user: f.user });
      } else {
        outgoing.push({ friendshipId: f.id, user: f.friend });
      }
    }
  }

  const connectedIds = new Set<string>([userId]);
  for (const f of friendships) {
    connectedIds.add(f.userId);
    connectedIds.add(f.friendId);
  }

  const suggestions = await prisma.user.findMany({
    where: { id: { notIn: [...connectedIds] } },
    select: { id: true, name: true, email: true, currentlyWatching: true },
    take: 20,
  });

  return NextResponse.json({ friends, incoming, outgoing, suggestions });
}

const postSchema = z.object({
  friendId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  action: z.enum(["request", "accept", "decline", "remove"]),
  friendshipId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { action, friendshipId, email } = parsed.data;
  let { friendId } = parsed.data;

  if (action === "request") {
    if (!friendId && email) {
      const target = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!target) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      friendId = target.id;
    }
    if (!friendId) {
      return NextResponse.json({ error: "friendId or email required" }, { status: 400 });
    }
    if (friendId === userId) {
      return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Already connected or pending" }, { status: 409 });
    }

    const friendship = await prisma.friendship.create({
      data: { userId, friendId, status: "pending" },
    });
    return NextResponse.json({ friendship }, { status: 201 });
  }

  if (!friendshipId) {
    return NextResponse.json({ error: "friendshipId required" }, { status: 400 });
  }

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "accept") {
    if (friendship.friendId !== userId || friendship.status !== "pending") {
      return NextResponse.json({ error: "Cannot accept" }, { status: 403 });
    }
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" },
    });
    return NextResponse.json({ friendship: updated });
  }

  if (action === "decline" || action === "remove") {
    const involved =
      friendship.userId === userId || friendship.friendId === userId;
    if (!involved) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.friendship.delete({ where: { id: friendshipId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
