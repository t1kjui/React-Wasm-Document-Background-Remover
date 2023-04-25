import React from "react";
import { useState, useEffect } from "react"
import './Dropzone.css'

import { Button, Icon, Switch } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GradientIcon from '@mui/icons-material/Gradient';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { useCookies } from 'react-cookie';
import { jsPDF } from "jspdf";
import { downloadZip } from "client-zip"
import CardsDisplay from "./CardsDisplay";
import wasmModule from "./customAlghoritm.mjs";

import langs from "./langs.json"

export default function Dropzone() {
  const [files, setFiles] = useState([]);
  const [leftDisplayedImage, setLeftDisplayedImage] = useState(null);
  const [rightDisplayedImage, setRightDisplayedImage] = useState(null);
  const [myWasmModule, setMyWasmModule] = useState();
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState();
  const [printButtonDisabled, setPrintButtonDisabled] = useState();
  const [deleteBackgroundButtonDisabled, setDeleteBackgroundButtonDisabled] = useState();
  const [pdfButtonDisabled, setPdfButtonDisabled] = useState();

  const [cookies, setCookie] = useCookies(['lang']);

  const supportedFileTypes = ["image/png", "image/jpeg", "image/bmp", "image/tiff"]

  useEffect(() => {
    wasmModule().then((Module) => {
      setMyWasmModule(Module);
      console.log("WASM module loaded!");
    });

    setDownloadButtonDisabled(true);
    setPrintButtonDisabled(true);
    setDeleteBackgroundButtonDisabled(true);
    setPdfButtonDisabled(true);
  }, []);

  useEffect(() => {
    console.log(cookies.lang);
    if (!cookies.lang) {
      const userLang = navigator.language || navigator.userLanguage;
      setCookie('lang', userLang, { path: '/' });
    }
  }, []);

  // Log changes in files array
  useEffect(() => {
    console.log(files);


    if (files.length != 0) {
      document.getElementById("canvas_wrapper").classList.toggle('expand', true);
      document.getElementById("leftCanvas").classList.toggle('show', true);

      drawImage(files[0].URL, "viewport", 1);
      setLeftDisplayedImage(files[0]);

      setDownloadButtonDisabled(false);
      setPrintButtonDisabled(false);
      setDeleteBackgroundButtonDisabled(false);
      setPdfButtonDisabled(false);

    } else {
      document.getElementById("canvas_wrapper").classList.toggle('expand', false);
      document.getElementById("leftCanvas").classList.toggle('show', false);
      document.getElementById("rightCanvas").classList.toggle('show', false);

      setDownloadButtonDisabled(true);
      setPrintButtonDisabled(true);
      setDeleteBackgroundButtonDisabled(true);
      setPdfButtonDisabled(true);
    }
  }, [files.length])

  useEffect(() => {
    // Prevent first load error
    if (leftDisplayedImage !== null) {
      if (leftDisplayedImage.fileObject.type === "image/bmp") {
        setDeleteBackgroundButtonDisabled(false);
      } else {
        setDeleteBackgroundButtonDisabled(true);
      }
      if (rightDisplayedImage != null) {
        clearCanvas("cropViewport");
        document.getElementById("rightCanvas").classList.toggle('show', false);
      }
    }
  }, [leftDisplayedImage])

  /////////////////////
  // File operations //
  /////////////////////

  // File drag-n-drop
  async function dropHandler(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('File(s) dropped!');

    // Disableing the overlay
    document.getElementById("overlay").style.display = "none";

    if (ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          var newFile = ev.dataTransfer.items[i].getAsFile();
          if (validateFile(newFile)) {
            addNewFile({
              fileObject: newFile,
              URL: URL.createObjectURL(newFile),
              bgRemoved: false
            });
            console.log('... file[' + i + '].name = ' + newFile.name + ' is added.');
          } else {
            //TODO handle errror
            console.log('file format not supported!');
          }
        }
      }
    } else {
      //Preventing text inserts
      for (var j = 0; j < ev.dataTransfer.files.length; j++) {
        console.log('... file[' + j + '].name = ' + ev.dataTransfer.files[j].name);
        console.log('Only files allowed!');
      }
    }
  }

  function removeFile(file) {
    var filtered = files.filter(item => item !== file);
    setFiles(filtered);
    console.log(files);
  }

  function dragoverHandler(ev) {
    console.log('File(s) in drop zone');
    ev.preventDefault();
  }

  function dragendHandler(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    document.getElementById("overlay").style.display = "none";
  }

  function validateFile(file) {
    return supportedFileTypes.indexOf(file.type) > -1
  }

  function addNewFile(newFile) {
    setFiles(files => [...files, newFile]);
  }

  function uploadButtonHandler(ev) {
    for (var i = 0; i < ev.target.files.length; i++) {
      var newFile = ev.target.files[i];
      if (validateFile(newFile)) {
        addNewFile({
          fileObject: newFile,
          URL: URL.createObjectURL(newFile),
          bgRemoved: false
        });
      }
    }
  }

  //////////////////////
  // Canvas controlls //
  //////////////////////
  let zoomLevel1 = 1;
  let zoomLevel2 = 1;

  function drawImage(imageURL, canvasID, scale) {
    const canvas = document.getElementById(canvasID);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();
    myImage.src = imageURL;

    myImage.onload = function() {
      ctx.imageSmoothingEnabled = false;
      let scale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      let x = (canvas.width / 2) - (myImage.width / 2) * scale;
      let y = (canvas.height / 2) - (myImage.height / 2) * scale;

      ctx.drawImage(myImage, x, y, myImage.width * scale, myImage.height * scale);
      console.log("Image is drawn");
    }
    ctx.scale(scale, scale);
    console.log(Image);
  }

  function clearCanvas(canvasID) {
    const canvas = document.getElementById(canvasID);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function zoom1() {
    zoomLevel1 += 0.2;
    drawImage(leftDisplayedImage.URL, "viewport", zoomLevel1);
  }

  function zoomOut1() {
    zoomLevel1 -= 0.2;
    drawImage(leftDisplayedImage.URL, "viewport", zoomLevel1);
  }

  function zoom2() {
    zoomLevel2 += 0.2;
    drawImage(rightDisplayedImage.URL, "cropViewport", zoomLevel2);
  }

  function zoomOut2() {
    zoomLevel2 -= 0.2;
    drawImage(rightDisplayedImage.URL, "cropViewport", zoomLevel2);
  }

  function print() {
    const iframe = document.createElement('iframe');

    // Make it hidden
    iframe.style.height = 0;
    iframe.style.visibility = 'hidden';
    iframe.style.width = 0;

    iframe.setAttribute('srcdoc', '<html><body></body></html>');

    document.body.appendChild(iframe);

    iframe.addEventListener('load', () => {
      // Clone the image
      const image = document.createElement('img');
      image.src = leftDisplayedImage.URL;
      console.log(leftDisplayedImage);
      image.style.maxWidth = '100%';
      console.log(image);

      // Append the image to the iframe's body
      const body = iframe.contentDocument.body;
      body.style.textAlign = 'center';
      body.appendChild(image);

      image.addEventListener('load', () => {
        // Invoke the print when the image is ready
        iframe.contentWindow.print();
      });

      iframe.contentWindow.addEventListener('afterprint', () => {
        iframe.parentNode.removeChild(iframe);
      });
    });

  }

  //////////////////////////
  // WASM command section //
  //////////////////////////

  async function testWasm() {
    document.getElementById("progressIndicator").classList.toggle('show', true);
    document.getElementById("progressIndicator").value = Math.floor(Math.random() * 35);

    let bmpBuffer = await leftDisplayedImage.fileObject.arrayBuffer().then(buff => { return new Uint8Array(buff) });
    myWasmModule.FS.writeFile("testFile.bmp", bmpBuffer);
    console.log(myWasmModule.FS.readdir('./'));
    await myWasmModule.ccall("delete_background", ["number"], ["string"], ["./testFile.bmp"]);
    let result = await myWasmModule.FS.readFile("testRGB.bmp");
    let returnFile = new File([result], "demoFile.bmp", { type: "image/bmp" });
    let returnURL = URL.createObjectURL(returnFile);

    const canvas = document.getElementById("cropViewport");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();

    myImage.src = returnURL;

    myImage.onload = function() {
      ctx.imageSmoothingEnabled = false;
      let scale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      let x = (canvas.width / 2) - (myImage.width / 2) * scale;
      let y = (canvas.height / 2) - (myImage.height / 2) * scale;

      ctx.drawImage(myImage, x, y, myImage.width * scale, myImage.height * scale);
      console.log("Image is drawn");
    }


    let tempArray = []
    for (let i = 0; i < files.length; i++) {
      if (leftDisplayedImage.URL === files[i].URL) {
        tempArray[i] = { fileObject: returnFile, URL: URL.createObjectURL(returnFile) };
        setRightDisplayedImage(tempArray[i]);
      } else {
        tempArray[i] = files[i];
      }
    }
    setFiles(tempArray);

    document.getElementById("progressIndicator").value = 100;

    document.getElementById("rightCanvas").classList.toggle('show', true);
    await new Promise(r => setTimeout(r, 500));
    document.getElementById("progressIndicator").classList.toggle('show', false);
  }

  async function downloadAllZip() {

    if (files.length > 1) {
      var downloadList = [];
      files.forEach(file => downloadList.push(file.fileObject));
      console.log(downloadList);
      const blob = await downloadZip(downloadList).blob();

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "WASM_Magick.zip"
      link.click()
      link.remove()
      URL.revokeObjectURL(link)
    } else {
      const link = document.createElement("a");
      link.href = files[0].URL;
      link.download = files[0].fileObject.name;
      link.click()
      link.remove()
    }
  }

  function createPDF() {
    const doc = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      let newImage = new Image();
      newImage.src = files[i].URL;
      if (newImage.width > newImage.height) {
        doc.addPage([newImage.width, newImage.height], 'l');
        doc.addImage(newImage, 'bmp', 0, 0, newImage.width, newImage.height);
      } else {
        doc.addPage([newImage.width, newImage.height], 'w');
        doc.addImage(newImage, 'bmp', 0, 0, newImage.width, newImage.height);
      }
    }
    doc.deletePage(1);
    doc.save("WASMImages.pdf");
  }

  return (
    <div>
      <div id='titleBar'>
        <img id='wasmLogo' src='./WebAssembly_Logo.svg' alt='WASM Logo' draggable={false} />
        <h2>{ langs[cookies.lang]["title"] }</h2>
        <div id='langIcons'>
          <img className="langFlag" alt="" src="./GB.svg" draggable={false} onClick={() => setCookie('lang', "en", { path: '/' })} />
          <img className="langFlag" alt="" src="./HU.svg" draggable={false} onClick={() => setCookie('lang', "hu", { path: '/' })} />
        </div>
      </div>
      <div id="canvas_wrapper">
        <div id="leftCanvas">
          <canvas id="viewport" />
          <div className="canvasInputWrapper">
            <input className="canvasInput" type="button" id="plus1" onClick={zoom1} value="+" />
            <input className="canvasInput" type="button" id="minus1" onClick={zoomOut1} value="-" />
          </div>
        </div>
        <div id="rightCanvas">
          <canvas id="cropViewport" />
          <div className="canvasInputWrapper">
            <input className="canvasInput" type="button" id="plus1" onClick={zoom2} value="+" />
            <input type="button" id="minus2" className="canvasInput" onClick={zoomOut2} value="-" />
          </div>
        </div>
      </div>

      <div id="progressIndicatorWrapper">
        <progress id="progressIndicator" value="0" max="100"></progress>
      </div>

      <div id='controls'>
        <Button variant='contained' component='label'>
          <Icon component={FileUploadIcon} />
          { langs[cookies.lang]["upload"] }
          <input
            id='inputField'
            type="file"
            name="myImage"
            multiple
            style={{ display: 'none' }}
            onChange={(event) => {
              uploadButtonHandler(event)
            }} />
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={downloadButtonDisabled} variant='contained' onClick={downloadAllZip}>
          <Icon component={FileDownloadIcon} />
         { langs[cookies.lang]["download"] }
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={printButtonDisabled} variant='contained' onClick={print}>
          <Icon component={PrintIcon} />
          { langs[cookies.lang]["print"] }
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={deleteBackgroundButtonDisabled} variant='contained' onClick={testWasm}>
          <Icon component={GradientIcon} />
          { langs[cookies.lang]["delete_bg"] }
        </Button>
        <Button sx={{ mx: 1 }} className='controllButton' disabled={pdfButtonDisabled} type='button' variant='contained' onClick={createPDF}>
          <Icon component={PictureAsPdfIcon} />
          {  langs[cookies.lang]["create_pdf"] }
        </Button>
      </div>
      <div id="cardsDisplay" onDrop={dropHandler} onDragOver={dragoverHandler}>
        {files.length === 0 && (<p id='instructions'>{ langs[cookies.lang]["upload_instruction"] }</p>)}
        <CardsDisplay
          cookies={cookies}
          files={files}
          removeFile={removeFile}
          setFiles={setFiles}
          drawImage={drawImage}
          testWasm={testWasm}
          leftDisplayedImage={leftDisplayedImage}
          setLeftDisplayedImage={setLeftDisplayedImage} />
      </div>
    </div>

  )
}
