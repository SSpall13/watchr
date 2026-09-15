import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const service = (searchParams.get("service") || "").trim();

  const shows = await prisma.show.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { genre: { contains: q } },
                { overview: { contains: q } },
              ],
            }
          : {},
        service ? { streamingService: service } : {},
      ],
    },
    orderBy: { title: "asc" },
    take: 40,
  });

  return NextResponse.json({ shows });
}
