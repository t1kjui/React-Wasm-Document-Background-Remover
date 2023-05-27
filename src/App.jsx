/*
 * @author: Dávid Attila
 * @date: 2033
 */

import React, { useState, useEffect } from "react";

import { Icon, Button, Menu, MenuItem } from "@mui/material"
import DescriptionIcon from '@mui/icons-material/Description';
import HomeIcon from '@mui/icons-material/Home';
import FlagIcon from '@mui/icons-material/Flag';

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";
import Dropzone from "./components/Dropzone";
import About from "./components/About"

import langs from "./components/langs.json"

import './App.css'

export default function App() {

  // Setting the initial cookie and cookie handler
  const [cookies, setCookie] = useCookies(['lang']);
  const [siteLang, setSiteLang] = useState("hu");

  // Setting initial cookie
  useEffect(() => {
    if (cookies.lang) {
      setSiteLang(cookies.lang);
      document.title = langs[cookies.lang].tab.home
    }
  }, [cookies]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (lang) => {
    setAnchorEl(null);
    setCookie('lang', lang, { path: '/' })
  };

  return (
    <BrowserRouter>
      <CookiesProvider>
        <div id='titleBar'>
          <img id='wasmLogo' src='./wasm_logo.png' alt='WASM Logo' draggable={false} />
          <h2 id="title" >{langs[siteLang].title}</h2>
          <Link id="aboutButton" to="/">
            <Icon component={HomeIcon} />
            <b>{langs[siteLang].home}</b>
          </Link>
          <Link id="aboutButton" to="about">
            <Icon component={DescriptionIcon} />
            <b>{langs[siteLang].about}</b>
          </Link>
          <Button
            id="lang-button"
            variant="contained"
            color="success"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <Icon component={FlagIcon} />
            {langs[siteLang].lang_button}
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={() => handleClose("hu")}>
              <img className="langFlag" alt="" src="./HU.svg" draggable={false} />
              Magyar
            </MenuItem>
            <MenuItem onClick={() => handleClose("en")}>
              <img className="langFlag" alt="" src="./GB.svg" draggable={false} />
              English
            </MenuItem>
          </Menu>
        </div>

        <Routes>
          <Route exact path="/" element={<Dropzone cookies={cookies} siteLang={siteLang} />} />
          <Route exact path="/about" element={<About siteLang={siteLang} />} />
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
  );
}
