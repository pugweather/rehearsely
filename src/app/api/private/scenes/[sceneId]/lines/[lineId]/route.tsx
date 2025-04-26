import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: Request,
    {params}:{params: {sceneId: string, lineId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const body = await req.json()
    const {...updates} = body
    const {lineId} = params

    const res = await db
        .update(lines)
        .set(updates)
        .where(eq(lines.id, Number(lineId)))
        .returning()

return NextResponse.json({id: lineId, updates})

}

export async function DELETE(
    req: Request,
    {params}:{params: {sceneId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const body = await req.json()
    const {id} = body

    const res = await db
        .delete(lines)
        .where(eq(lines.id, id))

    return NextResponse.json({success: 201})

}