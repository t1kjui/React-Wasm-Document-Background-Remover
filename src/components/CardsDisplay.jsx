import ImageCard from "./ImageCard"
import { v4 as uuidv4 } from "uuid"

export default function CardsDisplay({ files }) {
    return (
        files.map(file => {
            return <ImageCard
                key={uuidv4()}

                files={files}
                file={file}
            />
        })
    )
}