# esbuild React Javascript Template

# WASM build command
em++ *.cpp -o customAlghoritm.mjs -s ENVIRONMENT='web' -s WASM=0 -s EXPORTED_RUNTIME_METHODS="['FS','ccall']" -sEXPORTED_FUNCTIONS=_delete_background -s FORCE_FILESYSTEM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s USE_ES6_IMPORT_META=0 -s EXPORT_NAME='wasmModule' -O1

em++ main.cpp Bitmap_Vall_Gyak/Greyscale\ Document\ Colour\ Filter/Image.cpp Bitmap_Vall_Gyak/Greyscale\ Document\ Colour\ Filter/CustomAlgorithm.cpp -o customAlghoritm.mjs -s ENVIRONMENT='web' -s WASM=0 -s EXPORTED_RUNTIME_METHODS="['FS','ccall']" -sEXPORTED_FUNCTIONS=_delete_background -s FORCE_FILESYSTEM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s USE_ES6_IMPORT_META=0 -s EXPORT_NAME='wasmModule' -O1 

> This is a Javascript template for [esbuild create react app](https://github.com/awran5/esbuild-create-react-app) project.

## What is inside?

- [esbuild](https://esbuild.github.io/)
- [Eslint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://github.com/typicode/husky)
- [lint-staged](https://github.com/okonet/lint-staged)
- [live-server](https://github.com/tapio/live-server)

## Update (06-11-2022)

- add: css module support [esbuild-css-modules-plugin](https://www.npmjs.com/package/esbuild-css-modules-plugin)
- add: sass/scss [esbuild-sass-plugin](https://www.npmjs.com/package/esbuild-sass-plugin)
- add: [PostCSS](https://github.com/postcss/postcss)
- add: [postcss-preset-env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env)
- add: [autoprefixer](https://github.com/postcss/autoprefixer)
- build: update React 18
- build: update dependencies
- refactor: rename `dist` folder to `build`
- refactor: rename `builder.js` folder to `builder.mjs`
- refactor: switch to npm instead of yarn

### License

MIT © [awran5](https://github.com/awran5/)
