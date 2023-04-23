import { dividerClasses } from '@mui/material';
import React from 'react'
import './ImageCard.css'

export default function ImageCard({ files, file, removeFile, setFiles, drawImage, testWasm, setLeftDisplayedImage }) {

  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref) {
      console.log(ref);
    }
  }, [])

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
    drawImage(file.URL, "viewport");
    setLeftDisplayedImage(file);
  }

  function getFileType(mime) {
    switch (mime) {
      case "image/bmp":
        return <div className="imageFormat">BMP</div>
      case "image/jpeg":
        return <div className="imageFormatError">JPEG</div>
      case "image/png":
        return <div className="imageFormatError">
                 PNG
                 <span className="tooltiptext">The background can only be deleted on BMP files!</span>
               </div>
      default:
        console.log("unknown type");
        return <div id="imageFormatError">UNKOWN</div>
    }
  }

  return (
    <div style={{ backgroundImage: "url(" + file.URL + ")" }} className='imageCard' onClick={handleDraw}>
      <div className='imageCardTitle'>{file.fileObject.name}</div>
      <button type="button" className={"removeButton"} onClick={handleRemoveFile}>X </button>
      <div id="swapButtons">
        <button type="button" className={"swapButton"} id={"leftSwap"} onClick={swapLeft}>{'<<<'}</button>
        { getFileType(file.fileObject.type) }
        <button type="button" className={"swapButton"} id={"rightSwap"} onClick={swapRight}>{'>>>'}</button>
      </div>
    </div>
  )
}
