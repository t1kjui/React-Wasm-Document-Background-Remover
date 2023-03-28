import React from "react";
import { useState, useEffect } from "react"
import './Dropzone.css'

import wasmModule from "./customAlghoritm.mjs";
import CardsDisplay from "./CardsDisplay";

export default function Dropzone() {
  const [files, setFiles] = useState([]);
  const [displayedImage, setDisplayedImage] = useState([]);
  const [myWasmModule, setMyWasmModule] = useState();

  const supportedFileTypes = ["image/png", "image/jpeg", "image/bmp", "image/tiff"]

  useEffect(() => {
    wasmModule().then((Module) => {
      setMyWasmModule(Module);


      console.log("WASM module loaded!");
    });
  }, []);

  // Log changes in files array
  useEffect(() => {
    console.log(files);
  }, [files])

  // File operations
  function removeFile(file) {
    var filtered = files.filter(item => item !== file);
    setFiles(filtered);
    console.log(files);
  }

  useEffect(() => {
    if (!displayedImage) {
      setDisplayedImage(files[0]);
      drawImage(displayedImage);
    }
  }, [files])

  // File drag-n-drop
  function dropHandler(ev) {
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

  function drawImage(displayedImage) {
    console.log("clicked draw");


    const canvas = document.getElementById("viewport");
    console.log(canvas.clientWidth);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    const myImage = new Image();
    myImage.src = files[0].URL;

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
      image.src = files[0].URL;
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
    console.log(files[0]);
    let bmpBuffer = await files[0].fileObject.arrayBuffer().then(buff => {return new Uint8Array(buff)});
    myWasmModule.FS.writeFile("testFile.bmp", bmpBuffer);
    console.log(myWasmModule.FS.readdir('./'));
    await myWasmModule.ccall("delete_background", ["number"], ["string"], ["./testFile.bmp"]);
    let result = await myWasmModule.FS.readFile("testRGB.bmp");
    console.log(result);
    let returnFile = new File([result], "demoFile.bmp", {type: "image/bmp"});
    console.log(returnFile);
    let returnURL = URL.createObjectURL(returnFile);
    console.log(returnURL);
  }

  return (
    <div>
      <div id="canvas_wrapper">
        <canvas id="viewport" />
        <canvas id="cropViewport" />
        <div id="buttonWrapper">
          <input type="button" id="plus" value="+" /><input type="button" id="minus" value="-" />
        </div>
      </div>
      <label htmlFor="inputField" className="custom-file-upload">
        Custom Upload
        <input
          id='inputField'
          type="file"
          name="myImage"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => {
            uploadButtonHandler(event)
          }} />
      </label>
      <button type='button' onClick={drawImage}>Show Image</button>
      <button type='button' onClick={() => cropImage(100, 50, 100, 0)}>Crop</button>
      <button type='button' onClick={print}>Print</button>
      <button type='button' onClick={testWasm}>WASM Test</button>
      <div>
        <input type="range" min="1" max="100" defaultValue="50" className="slider" id="myRange" />
      </div>

      <div id="cardsDisplay" onDrop={dropHandler} onDragOver={dragoverHandler}>
        {files.length === 0 && (<p id='instructions'>Drag and drop files here...</p>)}
        <CardsDisplay files={files} removeFile={removeFile} setFiles={setFiles}></CardsDisplay>
      </div>
    </div>

  )
}
