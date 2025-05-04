
import { scenes, lines } from "@/database/drizzle/schema";
import { eq } from "drizzle-orm";
import { ReactNode } from "react";
import db from "@/app/database";
import EditorAndPlayWrapperClient from "@/app/components/editor/EditorAndPlayWrapperClient";

type Props = {
    params: {
        sceneId: string,
    };
    children: ReactNode
}

const Editor = async ({params, children}: Props) => {

    // Scene
    const {sceneId} = params
    const sceneRes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, Number(sceneId)))
    const scene = sceneRes[0] || null

    // Scene Lines
    const linesRes = await db
        .select()
        .from(lines)
        .where(eq(lines.scene_id, Number(sceneId)))
    const lineItems = linesRes || null

    return (
        <EditorAndPlayWrapperClient scene={scene} lineItems={lineItems}/>
    )
}

export default Editor