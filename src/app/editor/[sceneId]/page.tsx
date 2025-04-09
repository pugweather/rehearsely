import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import EditorWrapper from "../../components/editor/EditorWrapper";
import SceneSettings from "../../components/editor/SceneSettings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { scenes } from "@/database/drizzle/schema";
import db from "@/app/database";
import { eq } from "drizzle-orm";

type Props = {
    params: {
        sceneId: string;
    }
}

const Editor = async ({params}: Props) => {

    const {sceneId} = params
    const sceneRes = await db
        .select()
        .from(scenes)
        .where(eq(scenes.id, Number(sceneId)))
    const scene = sceneRes[0] || null

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <Navbar />
            <EditorWrapper>
                <div className="relative text-gray-500 py-6 border-b border-b-gray-300">
                    <Link href="/scenes-dashboard"><FontAwesomeIcon icon={faArrowLeftLong} /> <span className="ml-1">Back to Scenes</span></Link>
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-900">{scene.name}</div>
                </div>
                <SceneSettings />
                <div className="flex flex-col items-center py-8">
                    {/* Lines will go here */}
                </div>
            </EditorWrapper>
        </div>
    )
}

export default Editor