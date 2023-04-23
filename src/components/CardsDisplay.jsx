import React from "react"
import ImageCard from "./ImageCard"
import { v4 as uuidv4 } from "uuid"

export default function CardsDisplay({ files, removeFile, setFiles, drawImage, testWasm, leftDisplayedImage, setLeftDisplayedImage }) {
    return (
        files.map(file => {
            return <ImageCard
                key={uuidv4()}

                files={files}
                file={file}

                removeFile={removeFile}
                setFiles={setFiles}
                drawImage={drawImage}
                testWasm={testWasm}
                leftDisplayedImage={leftDisplayedImage}
                setLeftDisplayedImage={setLeftDisplayedImage}
            />
        })
    )
}
