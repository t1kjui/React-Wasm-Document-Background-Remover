import React from "react";
import { useState, useEffect } from "react"
import './Dropzone.css'


import { Button, Icon, Switch } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GradientIcon from '@mui/icons-material/Gradient';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { jsPDF } from "jspdf";
import { downloadZip } from "client-zip"
import { FlagIcon } from "react-flag-kit";
// import JSZip from "jszip"
import CardsDisplay from "./CardsDisplay";
import wasmModule from "./customAlghoritm.mjs";

export default function Dropzone() {
  const [files, setFiles] = useState([]);
  const [displayedImage, setDisplayedImage] = useState([]);
  const [myWasmModule, setMyWasmModule] = useState();

  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState();
  const [printButtonDisabled, setPrintButtonDisabled] = useState();
  const [deleteBackgroundButtonDisabled, setDeleteBackgroundButtonDisabled] = useState();
  const [pdfButtonDisabled, setPdfButtonDisabled] = useState();

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

  // Log changes in files array
  useEffect(() => {
    console.log(files);


    if (files.length != 0) {
      document.getElementById("canvas_wrapper").classList.toggle('expand', true);
      document.getElementById("leftCanvas").classList.toggle('show', true);

      drawImage(files[0].URL);
      setDisplayedImage(files[0]);

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
    console.log(displayedImage);
  }, [displayedImage])

  // File operations
  function removeFile(file) {
    var filtered = files.filter(item => item !== file);
    setFiles(filtered);
    console.log(files);
  }

  // File drag-n-drop
  function dropHandler(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('File(s) dropped!');

    // Disableing the overlay
    document.getElementById("overlay").style.display = "none";

    const currentFileLength = files.length;
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

  useEffect(() => {
    let canvas = document.getElementById("viewport");

    let translatePos = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };

    let scale = 1.0;
    let scaleMultiplier = 0.8;
    let startDragOffset = {};
    let mouseDown = false;

    // add button event listeners
    document.getElementById("plus").addEventListener("click", function() {
      scale /= scaleMultiplier;
      reDraw(scale, translatePos);
    }, false);

    document.getElementById("minus").addEventListener("click", function() {
      scale *= scaleMultiplier;
      reDraw(scale, translatePos);
    }, false);

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function(evt) {
      mouseDown = true;
      startDragOffset.x = evt.clientX - translatePos.x;
      startDragOffset.y = evt.clientY - translatePos.y;
    });

    canvas.addEventListener("mouseup", function(evt) {
      mouseDown = false;
    });

    canvas.addEventListener("mouseover", function(evt) {
      mouseDown = false;
    });

    canvas.addEventListener("mouseout", function(evt) {
      mouseDown = false;
    });

    canvas.addEventListener("mousemove", function(evt) {
      if (mouseDown) {
        translatePos.x = evt.clientX - startDragOffset.x;
        translatePos.y = evt.clientY - startDragOffset.y;
        reDraw(scale, translatePos);
      }
    });
  }, [])

  function drawImage(imageURL) {
    console.log("clicked draw");
    console.log(imageURL);

    const canvas = document.getElementById("viewport");

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
    console.log(Image);
  }

  function reDraw(scale, translatePos) {
    let canvas = document.getElementById("viewport");
    let context = canvas.getContext("2d");

    context.save();
    context.translate(translatePos.x, translatePos.y);
    context.scale(scale, scale);

    const myImage = new Image();
    myImage.src = displayedImage.URL;

    myImage.onload = function() {
      context.imageSmoothingEnabled = false;
      let scale = Math.min(canvas.width / myImage.width, canvas.height / myImage.height);
      let x = (canvas.width / 2) - (myImage.width / 2) * scale;
      let y = (canvas.height / 2) - (myImage.height / 2) * scale;

      context.drawImage(myImage, x, y, myImage.width * scale, myImage.height * scale);
      console.log("Image is drawn");
    }

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
      image.src = displayedImage.URL;
      console.log(displayedImage);
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

  ////////////////////////
  // Image crop section //
  ////////////////////////
  function cropImage(cropLeft, cropTop, cropRight, cropBottom) {
    console.log("clicked crop");
    const canvas = document.getElementById("cropViewport");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();
    myImage.src = files[0].URL;

    myImage.onload = function() {
      ctx.imageSmoothingEnabled = false;
      let scale = Math.min(canvas.width / (myImage.width - (cropLeft + cropRight)), canvas.height / (myImage.height - (cropTop + cropBottom)));
      let x = (canvas.width / 2) - ((myImage.width - (cropLeft + cropRight)) / 2) * scale;
      let y = (canvas.height / 2) - ((myImage.height - (cropTop + cropBottom)) / 2) * scale;

      console.log(myImage.width)


      ctx.drawImage(myImage, cropLeft, cropTop, myImage.width - cropRight, myImage.height - cropBottom, x - (cropLeft - cropRight) / 2, y, myImage.width * scale, myImage.height * scale);

      console.log("Image is drawn");
    }
  }

  async function testWasm() {
    document.getElementById("rightCanvas").classList.toggle('show', true);

    let bmpBuffer = await displayedImage.fileObject.arrayBuffer().then(buff => { return new Uint8Array(buff) });
    myWasmModule.FS.writeFile("testFile.bmp", bmpBuffer);
    console.log(myWasmModule.FS.readdir('./'));
    await myWasmModule.ccall("delete_background", ["number"], ["string"], ["./testFile.bmp"]);
    let result = await myWasmModule.FS.readFile("testRGB.bmp");
    console.log(result);
    let returnFile = new File([result], "demoFile.bmp", { type: "image/bmp" });
    console.log(returnFile);
    let returnURL = URL.createObjectURL(returnFile);
    console.log(returnURL);

    const canvas = document.getElementById("cropViewport");
    console.log(canvas.clientWidth);

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
      console.log("trying Changing image");
      console.log(displayedImage.URL);
      console.log(files[i].URL);

      if (displayedImage.URL === files[i].URL) {
        tempArray[i] = { fileObject: returnFile, URL: URL.createObjectURL(returnFile) };
        console.log("Changing file");
        console.log(files[i]);
      } else {
        tempArray[i] = files[i];
      }
    }
    setFiles(tempArray);
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

  // let zip = JSZip();


  // if (files.length > 1) {
  //   let downloadList = [];
  //   files.forEach(file => downloadList.push(file.fileObject));
  //   const img = zip.folder("images");

  //   //img.file("smile.gif", imgData, {base64: true});
  //   console.log(files[0].URL);
  //   files.forEach(file => img.file(file.fileObject.name, file.URL))

  //   zip.generateAsync({type:"blob"}).then(function(content) {

  //     const downloadUrl = URL.createObjectURL(content);
  //     downloadUrl.download = "WASM_Magick.zip"
  //     const a = document.createElement('a');

  //     a.href = downloadUrl;
  //     document.body.appendChild(a);
  //     a.click();

  //   });
  // }

  return (
    <div>
      <div id='titleBar'>
        <img id='wasmLogo' src='./WebAssembly_Logo.svg' alt='WASM Logo' draggable={false} />
        <h2>Document Background Remover Powered by WASM</h2>
        <div id='langIcons'>
          <img className="langFlag" alt="" src="./GB.svg" draggable={false}/>
          <img className="langFlag" alt="" src="./HU.svg" draggable={false}/>
        </div>
      </div>
      <div id="canvas_wrapper">
        <div id="leftCanvas">
          <canvas id="viewport" />
          <div className="canvasInputWrapper">
            <input className="canvasInput" type="button" id="plus" value="+" />
            <input type="button" id="minus" className="canvasInput" value="-" />
          </div>
        </div>
        <div id="rightCanvas">
          <canvas id="cropViewport" />
          <div className="canvasInputWrapper">
            <input className="canvasInput" type="button" id="plus" value="+" />
            <input type="button" id="minus" className="canvasInput" value="-" />
          </div>
        </div>
      </div>

      <div id='controls'>
        <Button variant='contained' component='label'>
          <Icon component={FileUploadIcon} />
          Upload
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
          Download</Button>
        <Button sx={{ mx: 1 }} type='button' disabled={printButtonDisabled} variant='contained' onClick={print}>
          <Icon component={PrintIcon} />
          Print Image
        </Button>
        <Button sx={{ mx: 1 }} type='button' disabled={deleteBackgroundButtonDisabled} variant='contained' onClick={testWasm}>
          <Icon component={GradientIcon} />
          Delete Background
        </Button>
        <Button sx={{ mx: 1 }} className='controllButton' disabled={pdfButtonDisabled} type='button' variant='contained' onClick={createPDF}>
          <Icon component={PictureAsPdfIcon} />
          Create PDF
        </Button>
      </div>
      <div id="cardsDisplay" onDrop={dropHandler} onDragOver={dragoverHandler}>
        {files.length === 0 && (<p id='instructions'>Drag and drop files here...</p>)}
        <CardsDisplay files={files} removeFile={removeFile} setFiles={setFiles} drawImage={drawImage} testWasm={testWasm} setDisplayedImage={setDisplayedImage} />
      </div>
    </div>

  )
}
