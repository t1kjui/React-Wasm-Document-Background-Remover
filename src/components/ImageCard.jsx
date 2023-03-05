import './ImageCard.css'

export default function ImageCard({ files, file}) {
    return (
        <div style={{ backgroundImage: "url(" + file.URL + ")" }} className='imageCard'>
            <div className='righSwap'> {'<'} </div>
            <div className='imageCardTitle'>{file.fileObject.name}</div>
        </div>
    )
}