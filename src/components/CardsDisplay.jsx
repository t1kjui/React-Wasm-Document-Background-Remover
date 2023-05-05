import React from "react"
import ImageCard from "./ImageCard"
import { v4 as uuidv4 } from "uuid"

export default function CardsDisplay({ cookies, siteLang, files, removeFile, setFiles, drawImage, deleteBackground, leftDisplayedImage, setLeftDisplayedImage }) {
    return (
        files.map(file => {
            return <ImageCard
                key={uuidv4()}

                cookies={cookies}
                siteLang={siteLang}
                files={files}
                file={file}

                removeFile={removeFile}
                setFiles={setFiles}
                drawImage={drawImage}
                deleteBackground={deleteBackground}
                leftDisplayedImage={leftDisplayedImage}
                setLeftDisplayedImage={setLeftDisplayedImage}
            />
        })
    )
}
