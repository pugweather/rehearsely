import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function PATCH(
    req: Request,
    {params}:{params: {sceneId: string}}
) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await req.json();
    const { lineUpdates } = body as { lineUpdates: { id: number; order: number }[] };

    if (!Array.isArray(lineUpdates) || lineUpdates.length === 0) {
        return NextResponse.json({ error: "Must pass lineUpdates array" }, { status: 400 });
    }

    const sceneId = Number(params.sceneId);
    try {
        let updated: any[] = [];

        if (lineUpdates.length === 2) {
            // Swap behavior for exactly two lines
            const [a, b] = lineUpdates;
            updated = await db.transaction(async (tx) => {
                // Ensure both lines belong to this scene
                const [lineA] = await tx.select().from(lines).where(and(eq(lines.id, a.id), eq(lines.scene_id, sceneId)));
                const [lineB] = await tx.select().from(lines).where(and(eq(lines.id, b.id), eq(lines.scene_id, sceneId)));

                if (!lineA || !lineB) {
                    throw new Error("Lines not found in scene");
                }

                // Compute unique temp order
                const maxOrderRows = await tx
                    .select({ maxOrder: sql<number>`max(${lines.order})` })
                    .from(lines);
                const currentMax = maxOrderRows?.[0]?.maxOrder ?? 0;
                const tempOrder = (Number(currentMax) || 0) + 1;

                // Move A to temp, put B into A's, then A into B's
                await tx.update(lines).set({ order: tempOrder }).where(eq(lines.id, lineA.id));
                await tx.update(lines).set({ order: lineA.order }).where(eq(lines.id, lineB.id));
                await tx.update(lines).set({ order: lineB.order }).where(eq(lines.id, lineA.id));

                const [updatedA] = await tx.select().from(lines).where(eq(lines.id, a.id));
                const [updatedB] = await tx.select().from(lines).where(eq(lines.id, b.id));
                return [updatedA, updatedB];
            });
        } else {
            // Full re-number update for the scene using a two-phase approach
            updated = await db.transaction(async (tx) => {
                // Validate all belong to the scene
                for (const item of lineUpdates) {
                    const [row] = await tx
                        .select()
                        .from(lines)
                        .where(and(eq(lines.id, item.id), eq(lines.scene_id, sceneId)));
                    if (!row) {
                        throw new Error(`Line ${item.id} not found in scene ${sceneId}`);
                    }
                }

                // Compute a global max order to derive unique temporary orders
                const maxOrderRows = await tx
                    .select({ maxOrder: sql<number>`max(${lines.order})` })
                    .from(lines);
                const currentMax = maxOrderRows?.[0]?.maxOrder ?? 0;
                const tempBase = (Number(currentMax) || 0) + 1;

                // Phase 1: move all target lines to unique temporary orders
                for (let i = 0; i < lineUpdates.length; i++) {
                    const { id } = lineUpdates[i];
                    await tx.update(lines).set({ order: tempBase + i }).where(eq(lines.id, id));
                }

                // Phase 2: set the final desired orders
                for (const item of lineUpdates) {
                    await tx.update(lines).set({ order: item.order }).where(eq(lines.id, item.id));
                }

                // Return updated rows
                const ids = lineUpdates.map((x) => x.id);
                const updatedRows: any[] = [];
                for (const id of ids) {
                    const [row] = await tx.select().from(lines).where(eq(lines.id, id));
                    if (row) updatedRows.push(row);
                }
                return updatedRows;
            });
        }

        return NextResponse.json({ success: true, updatedLines: updated });
    } catch (error) {
        console.error("Error updating line orders:", error);
        return NextResponse.json({ error: "Failed to update line orders" }, { status: 500 });
    }
}
