import React from 'react'
import './ImageCard.css'

export default function ImageCard({ cookies, siteLang, files, file, removeFile, setFiles, drawImage, deleteBackground, leftDisplayedImage, setLeftDisplayedImage }) {

  function swapLeft(ev) {
    ev.stopPropagation()
    if (files.indexOf(file) !== 0) {
      let tmpFiles = [...files];
      let position = tmpFiles.indexOf(file);

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
      let tmpFiles = [...files];
      let position = tmpFiles.indexOf(file);

      [tmpFiles[position + 1], tmpFiles[position]] = [tmpFiles[position], tmpFiles[position + 1]]

      setFiles(tmpFiles)
    }
  }

  function handleDraw() {
    if (leftDisplayedImage !== file) {
      drawImage(file.URL, "viewport");
      setLeftDisplayedImage(file);
    }
  }

  function getFileType(mime) {
    switch (mime) {
      case "image/bmp":
        return <div className="imageFormat">BMP</div>
      case "image/jpeg":
        return <div className="imageFormat">
          JPEG
        </div>
      case "image/png":
        return <div className="imageFormat">
          PNG
        </div>
      default:
        console.log("unknown type");
        return <div id="imageFormatError">UNKOWN</div>
    }
  }

  function setBorderColor() {
    if (leftDisplayedImage === file) {
      return "2px solid #1E88E5"
    }
    return ""
  }

  return (
    <div style={{ backgroundImage: `url( ${file.URL})`, border: setBorderColor() }} className='imageCard' onClick={handleDraw}>
      <div className='imageCardTitle'>{file.fileObject.name}</div>
      <button type="button" className={"removeButton"} onClick={handleRemoveFile}>X </button>
      <div id="swapButtons">
        <button type="button" className={"swapButton"} id={"leftSwap"} onClick={swapLeft}>{'<<<'}</button>
        {getFileType(file.fileObject.type)}
        <button type="button" className={"swapButton"} id={"rightSwap"} onClick={swapRight}>{'>>>'}</button>
      </div>
    </div>
  )
}
