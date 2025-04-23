import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../../utils/supabase/server";
import { lines } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";

export async function PATCH(
    req: Request,
    {params}:{params: {sceneId: string}}
) {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const body = await req.json()
    const {id, ...updates} = body

    const res = await db
        .update(lines)
        .set(updates)
        .where(eq(lines.id, id))
        .returning()
    
    const line = res[0]

    return NextResponse.json({line})

}