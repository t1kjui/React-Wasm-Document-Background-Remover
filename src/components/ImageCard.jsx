import React from 'react'
import './ImageCard.css'

export default function ImageCard({ files, file, removeFile, setFiles, drawImage, testWasm, setDisplayedImage }) {

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

  function handleDraw() {
    drawImage(file.URL);
    setDisplayedImage(file);
  }

  return (
    <div style={{ backgroundImage: "url(" + file.URL + ")" }} className='imageCard' onClick={handleDraw}>
      <div className='imageCardTitle'>{file.fileObject.name}</div>
      <button type="button" className={"removeButton"} onClick={handleRemoveFile}>X </button>
      <div id="swapButtons">
        <button type="button" className={"swapButton"} id={"leftSwap"} onClick={swapLeft}>{'<<<'}</button>
        <button type="button" className={"swapButton"} id={"rightSwap"} onClick={swapRight}>{'>>>'}</button>

      </div>
    </div>
  )
}
