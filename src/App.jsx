import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import Dropzone from "./components/Dropzone";
import About from "./components/About"

import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <CookiesProvider>
        <Routes>
          <Route exact path="/" element={ <Dropzone/> }/>
          <Route exact path="/about" element= { <About/> } />
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
  );
}
