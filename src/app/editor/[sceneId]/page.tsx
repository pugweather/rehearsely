
import { scenes, lines } from "@/database/drizzle/schema";
import { useRef } from "react";
import { eq } from "drizzle-orm";
import EditorWrapperClient from "@/app/components/editor/EditorWrapperClient";
import db from "@/app/database";
import { Line } from "@/app/types";

type Props = {
    params: {
        sceneId: string;
      };
}

const Editor = async ({params}: Props) => {

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
        <EditorWrapperClient
            scene={scene}
            lineItems={lineItems}
        >

        </EditorWrapperClient>
    )
}

export default Editor