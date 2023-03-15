import React from "react";
import { useState, useEffect } from "react"
import './Dropzone.css'

import createModule from "./backgroundRemover.mjs";
import CardsDisplay from "./CardsDisplay";

export default function Dropzone() {
    const [files, setFiles] = useState([]);
    const [displayedImage, setDisplayedImage] = useState([]);
    const [wasmModule, setWasmModule] = useState();

    const supportedFileTypes = ["image/png", "image/jpeg", "image/bmp", "image/tiff"]

    useEffect(() => {
        createModule().then((Module) => {
            setWasmModule(Module);
            console.log("WASM module loaded!");
        });
    }, []);

    //Log changes in files array
    useEffect(() => {
        console.log(files);
    }, [files])

    //File operations 
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

    //File drag-n-drop
    function dropHandler(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log('File(s) dropped!');

        //Disableing the overlay
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
        console.log("clicked");
        const canvas = document.getElementById("viewport");
        const ctx = canvas.getContext("2d");
        const Image = new Image;
        Image.src = displayedImage.URL;

        Image.onload = function () {
            ctx.imageSmoothingEnabled = false;
            var scale = Math.min(canvas.width / Image.width, canvas.height / Image.height);
            var x = (canvas.width / 2) - (Image.width / 2) * scale;
            var y = (canvas.height / 2) - (Image.height / 2) * scale;

            ctx.drawImage(Image, x, y, Image.width * scale, Image.height * scale);
            console.log("Image is drawn");
        }
        console.log(Image);
    }

    async function wasmDemo() {
        console.log(wasmModule.FS.readdir('./'));

    }

    return (
        <div>
            <div id="canvas_wrapper">
                <canvas id="viewport"></canvas>
                <div id="buttonWrapper">
                    <input type="button" id="plus" value="+" /><input type="button" id="minus" value="-" />
                </div>
            </div>
            <label htmlFor="inputField" className="custom-file-upload">
                Custom Upload
            </label>
            <button onClick={drawImage}>click</button>
            <img id="source"></img>
            <input
                id='inputField'
                type="file"
                name="myImage"
                multiple
                style={{ display: 'none' }}
                onChange={(event) => {
                    uploadButtonHandler(event)
                }} />

            <div id="cardsDisplay" onDrop={dropHandler} onDragOver={dragoverHandler}>
                {files.length === 0 && (<p id='instructions'>Drag and drop files here...</p>)}
                <CardsDisplay files={files} removeFile={removeFile} setFiles={setFiles}></CardsDisplay>
            </div>
        </div>

    )
}