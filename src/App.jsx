import React from "react";
import { CookiesProvider } from "react-cookie";
import Dropzone from "./components/Dropzone";

import './App.css'

export default function App() {
  function dragoverHandler(ev) {
    ev.preventDefault();
    document.getElementById("overlay").style.display = "block";
  }

  function dragendHandler(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    document.getElementById("overlay").style.display = "none";
  }

  return (
    <CookiesProvider>
      <div onDragOver={dragoverHandler}>
        <div id="overlay"
          onClick={dragendHandler}
          onDragEnd={dragendHandler}
          onDragLeave={dragendHandler}
          onDrop={dragendHandler}
        ></div>
        <Dropzone></Dropzone>
      </div>
    </CookiesProvider>
  );
}
