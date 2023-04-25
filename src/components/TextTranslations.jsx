import React from 'react'
import langs from "./langs.json"

export default function TextTranslations(lang, component) {
  console.log(langs[lang][component]);
}
