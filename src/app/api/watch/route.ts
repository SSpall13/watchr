import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndGrantAwards } from "@/lib/awards";

const schema = z.object({
  showId: z.string().min(1),
  status: z.enum(["watching", "finished", "dropped", "want"]),
  progress: z.string().max(80).optional().nullable(),
  setCurrentlyWatching: z.boolean().optional(),
  setFavorite: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { showId, status, progress, setCurrentlyWatching, setFavorite } = parsed.data;

  const show = await prisma.show.findUnique({ where: { id: showId } });
  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const finishedAt = status === "finished" ? new Date() : null;

  const userShow = await prisma.userShow.upsert({
    where: { userId_showId: { userId, showId } },
    create: {
      userId,
      showId,
      status,
      progress: progress ?? null,
      finishedAt,
    },
    update: {
      status,
      progress: progress ?? null,
      finishedAt: status === "finished" ? new Date() : null,
    },
    include: { show: true },
  });

  const userUpdate: {
    currentlyWatchingId?: string | null;
    favoriteShowId?: string | null;
  } = {};

  if (setCurrentlyWatching || status === "watching") {
    if (setCurrentlyWatching !== false && status === "watching") {
      userUpdate.currentlyWatchingId = showId;
    }
  }
  if (setCurrentlyWatching === true) {
    userUpdate.currentlyWatchingId = showId;
  }
  if (status === "finished" || status === "dropped") {
    const me = await prisma.user.findUnique({ where: { id: userId } });
    if (me?.currentlyWatchingId === showId) {
      userUpdate.currentlyWatchingId = null;
    }
  }
  if (setFavorite === true) {
    userUpdate.favoriteShowId = showId;
  }

  if (Object.keys(userUpdate).length) {
    await prisma.user.update({ where: { id: userId }, data: userUpdate });
  }

  let awards: Awaited<ReturnType<typeof checkAndGrantAwards>> = [];
  if (status === "finished") {
    awards = await checkAndGrantAwards(userId, showId);
  }

  return NextResponse.json({ userShow, awards });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json();
  const action = body.action as string;

  if (action === "setCurrentlyWatching") {
    const showId = body.showId as string | null;
    if (showId) {
      const show = await prisma.show.findUnique({ where: { id: showId } });
      if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
      await prisma.userShow.upsert({
        where: { userId_showId: { userId, showId } },
        create: { userId, showId, status: "watching" },
        update: { status: "watching" },
      });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { currentlyWatchingId: showId || null },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "setFavorite") {
    const showId = body.showId as string | null;
    if (showId) {
      const show = await prisma.show.findUnique({ where: { id: showId } });
      if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { favoriteShowId: showId || null },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
