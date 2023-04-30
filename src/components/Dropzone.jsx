/*
 * @author: Dávid Attila
 * @date: 2033
 */

// React element imports
import React, { useState, useEffect } from "react"

// Custom CSS imports
import './Dropzone.css'

// Material UI element imports
import { Button, Icon } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GradientIcon from '@mui/icons-material/Gradient';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// NPM module imports
import { Link } from "react-router-dom"
import { useCookies } from 'react-cookie';
import { jsPDF } from "jspdf";
import { downloadZip } from "client-zip"
import CardsDisplay from "./CardsDisplay";

// The custom C++ algorithm exported to WASM
import wasmModule from "./customAlghoritm.mjs";

// Translated texts are stored in a JSON and are dynamically displayed with the given user preference
import langs from "./langs.json"

export default function Dropzone() {

  // Setting initial use states
  const [files, setFiles] = useState([]);
  const [leftDisplayedImage, setLeftDisplayedImage] = useState(null);
  const [rightDisplayedImage, setRightDisplayedImage] = useState(null);
  const [myWasmModule, setMyWasmModule] = useState();
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState();
  const [printButtonDisabled, setPrintButtonDisabled] = useState();
  const [deleteBackgroundButtonDisabled, setDeleteBackgroundButtonDisabled] = useState();
  const [pdfButtonDisabled, setPdfButtonDisabled] = useState();

  // Setting the initial cookie and cookie handler
  const [cookies, setCookie] = useCookies(['lang']);
  const [siteLang, setSiteLang] = useState("hu");

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

  // Setting initial cookie
  useEffect(() => {
    if (cookies.lang) {
      setSiteLang(cookies.lang);
    }
  }, [cookies]);

  // Log changes in files array
  useEffect(() => {
    if (files.length !== 0) {
      document.getElementById("canvas_wrapper").classList.toggle('expand', true);
      document.getElementById("leftCanvas").classList.toggle('show', true);

      setLeftDisplayedImage(files[0]);
      drawImage(files[0].URL, "viewport", 1);

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
    const viewport = document.getElementById("viewport");
    viewport.addEventListener("mousedown", (event) => handleMouseDown(event, "viewport"));
    viewport.addEventListener("mouseup", (event) => handleMouseUp(event, "viewport"));
    viewport.addEventListener("mouseout", (event) => handleMouseOut(event, "viewport"));
    viewport.addEventListener("mousemove", (event) => handleMouseMoveLeft(event, "viewport"));
  }, [leftDisplayedImage])

  useEffect(() => {
    const rightviewport = document.getElementById("cropViewport");
    rightviewport.addEventListener("mousedown", (event) => handleMouseDown(event, "cropViewport"));
    rightviewport.addEventListener("mouseup", (event) => handleMouseUp(event, "cropViewport"));
    rightviewport.addEventListener("mouseout", (event) => handleMouseOut(event, "cropViewport"));
    rightviewport.addEventListener("mousemove", (event) => handleMouseMoveRight(event, "cropViewport"));
  }, [rightDisplayedImage])

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

  // File operations

  // File drag-n-drop
  async function dropHandler(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('File(s) dropped!');

    // Disableing the overlay
    document.getElementById("overlay").style.display = "none";

    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i += 1) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          const newFile = ev.dataTransfer.items[i].getAsFile();
          if (validateFile(newFile)) {
            addNewFile({
              fileObject: newFile,
              URL: URL.createObjectURL(newFile),
              bgRemoved: false
            });
          } else {
            // TODO handle errror
            console.log('file format not supported!');
          }
        }
      }
    } else {
      // Preventing text inserts
      for (let j = 0; j < ev.dataTransfer.files.length; j += 1) {
        console.log('Only files allowed!');
      }
    }
  }

  function removeFile(file) {
    const filtered = files.filter(item => item !== file);
    setFiles(filtered);
  }

  function dragoverHandler(ev) {
    ev.preventDefault();
  }

  function overlayDragoverHandler(ev) {
    ev.preventDefault();
    document.getElementById("overlay").style.display = "block";
  }

  function overlayDragEndHandler(ev) {
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
    for (let i = 0; i < ev.target.files.length; i += 1) {
      const newFile = ev.target.files[i];
      if (validateFile(newFile)) {
        addNewFile({
          fileObject: newFile,
          URL: URL.createObjectURL(newFile),
          bgRemoved: false
        });
      }
    }
  }

  // Canvas controlls
  let zoomLevel1 = 1;
  let zoomLevel2 = 1;

  let isDragging;
  let canMouseX;
  let canMouseY;

  function handleMouseDown(e, canvasID) {
    const canvasOffset = document.getElementById(canvasID).getBoundingClientRect();
    document.getElementById(canvasID).style.cursor = "grabbing";
    const offsetX = canvasOffset.left;
    const offsetY = canvasOffset.top;
    canMouseX = parseInt(e.clientX - offsetX, 10);
    canMouseY = parseInt(e.clientY - offsetY, 10);
    isDragging = true;
  }

  function handleMouseUp(e, canvasID) {
    const canvasOffset = document.getElementById(canvasID).getBoundingClientRect();
    document.getElementById(canvasID).style.cursor = "grab";
    const offsetX = canvasOffset.left;
    const offsetY = canvasOffset.top;
    canMouseX = parseInt(e.clientX - offsetX, 10);
    canMouseY = parseInt(e.clientY - offsetY, 10);
    isDragging = false;
  }

  function handleMouseOut(e, canvasID) {
    const canvasOffset = document.getElementById(canvasID).getBoundingClientRect();
    document.getElementById(canvasID).style.cursor = "grabbing";
    const offsetX = canvasOffset.left;
    const offsetY = canvasOffset.top;
    canMouseX = parseInt(e.clientX - offsetX, 10);
    canMouseY = parseInt(e.clientY - offsetY, 10);
    isDragging = false;
  }

  function handleMouseMoveLeft(e) {
    if (isDragging && leftDisplayedImage) {
      const canvas = document.getElementById("viewport");
      const ctx = canvas.getContext("2d");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const canvasOffset = document.getElementById("viewport").getBoundingClientRect();
      const offsetX = canvasOffset.left;
      const offsetY = canvasOffset.top;
      canMouseX = parseInt(e.clientX - offsetX, 10);
      canMouseY = parseInt(e.clientY - offsetY, 10);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const myImage = new Image();
      myImage.src = leftDisplayedImage.URL;
      // ctx.drawImage(myImage, canMouseX - 128 / 2, canMouseY - 120 / 2, myImage.width, myImage.height);

      const correctionScale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      // const x = (canvas.width / 2) - (myImage.width / 2) * correctionScale;
      // const y = (canvas.height / 2) - (myImage.height / 2) * correctionScale;

      ctx.drawImage(myImage, canMouseX - canvas.width / 2, canMouseY - canvas.height / 2, myImage.width * correctionScale, myImage.height * correctionScale);

    }
  }

  function handleMouseMoveRight(e) {
    if (isDragging && leftDisplayedImage) {
      const canvas = document.getElementById("cropViewport");
      const ctx = canvas.getContext("2d");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const canvasOffset = document.getElementById("cropViewport").getBoundingClientRect();
      const offsetX = canvasOffset.left;
      const offsetY = canvasOffset.top;
      canMouseX = parseInt(e.clientX - offsetX, 10);
      canMouseY = parseInt(e.clientY - offsetY, 10);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const myImage = new Image();
      myImage.src = rightDisplayedImage.URL;
      // ctx.drawImage(myImage, canMouseX - 128 / 2, canMouseY - 120 / 2, myImage.width, myImage.height);

      const correctionScale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      // const x = (canvas.width / 2) - (myImage.width / 2) * correctionScale;
      // const y = (canvas.height / 2) - (myImage.height / 2) * correctionScale;

      ctx.drawImage(myImage, canMouseX - canvas.width / 2, canMouseY - canvas.height / 2, myImage.width * correctionScale, myImage.height * correctionScale);

    }
  }

  function drawImage(imageURL, canvasID, scale) {
    const canvas = document.getElementById(canvasID);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();
    myImage.src = imageURL;

    myImage.onload = function() {
      ctx.imageSmoothingEnabled = false;
      const correctionScale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      const x = (canvas.width / 2) - (myImage.width / 2) * correctionScale;
      const y = (canvas.height / 2) - (myImage.height / 2) * correctionScale;

      ctx.drawImage(myImage, x, y, myImage.width * correctionScale, myImage.height * correctionScale);
      console.log("Image is drawn");
    }
    ctx.scale(scale, scale);
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

  function zoomReset1() {
    zoomLevel1 = 1;
    drawImage(leftDisplayedImage.URL, "viewport", zoomLevel1);
  }

  function zoomReset2() {
    zoomLevel2 = 1;
    drawImage(rightDisplayedImage.URL, "cropViewport", zoomLevel2);
  }

  // Print command using via displaying the iamge via a separate iframe
  function print() {
    const iframe = document.createElement('iframe');

    iframe.style.height = 0;
    iframe.style.visibility = 'hidden';
    iframe.style.width = 0;

    iframe.setAttribute('srcdoc', '<html><body></body></html>');

    document.body.appendChild(iframe);

    iframe.addEventListener('load', () => {
      const image = document.createElement('img');
      image.src = leftDisplayedImage.URL;
      image.style.maxWidth = '100%';

      const { body } = iframe.contentDocument;
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

  // WASM command section

  async function testConvert() {
    const bmpBuffer = await leftDisplayedImage.fileObject.arrayBuffer().then(buff => { return new Uint8Array(buff) });
    myWasmModule.FS.writeFile("testFile.jpg", bmpBuffer);
    await myWasmModule.ccall("convert_to_bmp", ["number"], ["string"], ["./testFile.jpg"]);

    const result1 = await myWasmModule.FS.readFile("bmpImage.bmp");
    console.log(result1);
    const returnFile1 = new File([result1], "testFile.bmp", {type: "image/bmp"});
    const returnURL1 = URL.createObjectURL(returnFile1);
    console.log(returnURL1);

    await myWasmModule.ccall("delete_background", ["number"], ["string"], ["./bmpImage.bmp"]);
    const result = await myWasmModule.FS.readFile("test.bmp");

    console.log(result);
    const returnFile = new File([result], "testFile.bmp", {type: "image/bmp"});
    const returnURL = URL.createObjectURL(returnFile);
    console.log(returnURL);
  }

  async function testWasm() {
    // Turning the file object into a Uint8Array to be inserted into the virtual file system
    const bmpBuffer = await leftDisplayedImage.fileObject.arrayBuffer().then(buff => { return new Uint8Array(buff) });
    myWasmModule.FS.writeFile("testFile.bmp", bmpBuffer);

    // Calling the C function on the newly inserted file and reading out the generated image
    await myWasmModule.ccall("delete_background", ["number"], ["string"], ["./testFile.bmp"]);
    const result = await myWasmModule.FS.readFile("testRGB.bmp");

    // Creating a new File object and reference URL
    const returnFile = new File([result], "demoFile.bmp", { type: "image/bmp" });
    const returnURL = URL.createObjectURL(returnFile);

    // Displaying newly created image
    const canvas = document.getElementById("cropViewport");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();

    myImage.src = returnURL;

    myImage.onload = function() {
      ctx.imageSmoothingEnabled = false;
      const scale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      const x = (canvas.width / 2) - (myImage.width / 2) * scale;
      const y = (canvas.height / 2) - (myImage.height / 2) * scale;

      ctx.drawImage(myImage, x, y, myImage.width * scale, myImage.height * scale);
      console.log("Image is drawn");
    }

    // Updateing the files array with new image
    const tempArray = []
    for (let i = 0; i < files.length; i += 1) {
      if (leftDisplayedImage.URL === files[i].URL) {
        tempArray[i] = { fileObject: returnFile, URL: URL.createObjectURL(returnFile) };
        setRightDisplayedImage(tempArray[i]);
      } else {
        tempArray[i] = files[i];
      }
    }
    setFiles(tempArray);

    // Animating the canvas reveal
    document.getElementById("rightCanvas").classList.toggle('show', true);
    await new Promise(r => setTimeout(r, 500));
    document.getElementById("progressIndicator").classList.toggle('show', false);
  }

  async function deleteBackground() {
    document.getElementById("progressIndicator").classList.toggle('show', true);
    document.getElementById("progressIndicator").value = Math.floor(Math.random() * 35);
    await testWasm();
    document.getElementById("progressIndicator").value = 100;
  }

  async function handleTestConvert() {
    await testConvert();
  }

  // Generating ZIP via downloadZIP package
  async function downloadAllZip() {
    if (files.length > 1) {
      const downloadList = [];
      files.forEach(file => downloadList.push(file.fileObject));
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

  // Creating new PDF via jsPDF
  function createPDF() {
    const doc = new jsPDF();
    for (let i = 0; i < files.length; i += 1) {
      const newImage = new Image();
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
    <div onDragOver={overlayDragoverHandler}>
      <div id="overlay"
        onClick={overlayDragEndHandler}
        onDragEnd={overlayDragEndHandler}
        onDragLeave={overlayDragEndHandler}
        onDrop={overlayDragEndHandler} />
      <div id='titleBar'>
        <img id='wasmLogo' src='./WebAssembly_Logo.svg' alt='WASM Logo' draggable={false} />
        <h2>{langs[siteLang].title}</h2>
        <Link to="about">
          <button type="button" >Something</button>
        </Link>

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
            <input className="canvasInput" type="button" id="reset1" onClick={zoomReset1} value="[]" />
            <input className="canvasInput" type="button" id="minus1" onClick={zoomOut1} value="-" />
          </div>
        </div>
        <div id="rightCanvas">
          <canvas id="cropViewport" />
          <div className="canvasInputWrapper">
            <input className="canvasInput" type="button" id="plus1" onClick={zoom2} value="+" />
            <input className="canvasInput" type="button" id="reset2" onClick={zoomReset2} value="[]" />
            <input className="canvasInput" type="button" id="minus2" onClick={zoomOut2} value="-" />
          </div>
        </div>
      </div>

      <div id="progressIndicatorWrapper">
        <progress id="progressIndicator" value="0" max="100" />
      </div>

      <div id='controls'>
        <Button variant='contained' component='label'>
          <Icon component={FileUploadIcon} />
          {langs[siteLang].upload}
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
          {langs[siteLang].download}
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={printButtonDisabled} variant='contained' onClick={handleTestConvert}>
          <Icon component={PrintIcon} />
          {langs[siteLang].print}
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={deleteBackgroundButtonDisabled} variant='contained' onClick={testWasm}>
          <Icon component={GradientIcon} />
          {langs[siteLang].delete_bg}
        </Button>
        <Button sx={{ mx: 1 }} className='controllButton' disabled={pdfButtonDisabled} type='button' variant='contained' onClick={createPDF}>
          <Icon component={PictureAsPdfIcon} />
          {langs[siteLang].create_pdf}
        </Button>
      </div>
      <div id="cardsDisplay" onDrop={dropHandler} onDragOver={dragoverHandler}>
        {files.length === 0 && (<p id='instructions'>{langs[siteLang].upload_instruction}</p>)}
        <CardsDisplay
          cookies={cookies}
          siteLang={siteLang}
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
