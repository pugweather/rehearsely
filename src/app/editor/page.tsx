import React from "react";
import Navbar from "../components/layout/Navbar";
import EditorWrapper from "../components/editor/EditorWrapper";

const Editor = () => {
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <Navbar />
            <EditorWrapper></EditorWrapper>
        </div>
    )
}

export default Editor