import React from 'react'
import './ImageCard.css'

export default function ImageCard({ files, file, removeFile, setFiles}) {

    function swapLeft(ev) {
        ev.stopPropagation()
        if (files.indexOf(file) !== 0) {
            var tmpFiles = [...files];
            var position = tmpFiles.indexOf(file);

            [tmpFiles[position - 1], tmpFiles[position]] = [tmpFiles[position], tmpFiles[position - 1]]

            setFiles(tmpFiles)
        }
    }

    function handleRemoveFile(ev) {
        ev.stopPropagation();
        removeFile(file);
        URL.revokeObjectURL(file.URL)
    }

    function swapRight(ev) {
        ev.stopPropagation()
        if (files.indexOf(file) !== files.length - 1) {
            var tmpFiles = [...files];
            var position = tmpFiles.indexOf(file);

            [tmpFiles[position + 1], tmpFiles[position]] = [tmpFiles[position], tmpFiles[position + 1]]

            setFiles(tmpFiles)
        }
    }

    return (
        <div style={{ backgroundImage: "url(" + file.URL + ")" }} className='imageCard'>
            <div className='righSwap'> {'<'} </div>
            <div className='imageCardTitle'>{file.fileObject.name}</div>
            <button onClick={swapLeft}>{'<<<'}</button>
            <button className='removeButton' onClick={handleRemoveFile}>X </button>
            <button onClick={swapRight}>{'>>>'}</button>
        </div>
    )
}