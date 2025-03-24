import React from "react";
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import EditorWrapper from "../../components/editor/EditorWrapper";
import SceneSettings from "../../components/editor/SceneSettings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

const Editor = () => {
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <Navbar />
            <EditorWrapper>
                <div className="text-gray-500 py-6 border-b border-b-gray-300">
                    <Link href="/scenes-dashboard"><FontAwesomeIcon icon={faArrowLeftLong} /> <span className="ml-1">Back to Scenes</span></Link>
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