import React from "react"

import "./About.css"
import langs from "./langs.json"

export default function About({ siteLang }) {
  return (
    <div>
      <div className="textBox">
        <div className="heading">
          <h1>{langs[siteLang].about_page.title}</h1>
          <a href="https://github.com/t1kjui/React-Wasm-Document-Background-Remover" style={{marginLeft:"auto", marginRight:"0"}}>
            <img src="./github-mark-white.svg" alt="" width={"40pt"}  />
          </a>
        </div>
        <p>
          {langs[siteLang].about_page.text1}
          <br />
          <br />
          {langs[siteLang].about_page.supported_types}
          <ul>
            <li>png</li>
            <li>jpg</li>
            <li>bmp</li>
          </ul>
          <img src="./animation.gif" alt="Main page" width={"80%"} style={{ display: "block", marginLeft: "auto", marginRight: "auto" }} />
          <br />
          {langs[siteLang].about_page.text2}
          {langs[siteLang].about_page.text3}

          <br />
          <br />
        </p>
      </div>
      <div className="footer">
        <i>Dávid Attila - 2023 - hosted on ELTE Caesar Cluster</i>
      </div>
    </div>
  )
}
