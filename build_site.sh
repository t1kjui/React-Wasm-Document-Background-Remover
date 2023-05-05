#!/usr/bin/env sh

echo "Checking dependences..."
if ! command -v node &> /dev/null
then
    echo "node could not be found!"
    exit
fi
echo "node found"
if ! command -v npm &> /dev/null
then
    echo "npm could not be found!"
    exit
fi
echo "npm found"
if ! command -v em++ &> /dev/null
then
    echo "em++ could not be found!"
fi
echo "em++ found"
echo "All dependencies are found!"
echo "Building WASM module..."
em++ main.cpp "Bitmap_Vall_Gyak/Greyscale Document Colour Filter/Image.cpp" \
    "Bitmap_Vall_Gyak/Greyscale Document Colour Filter/CustomAlgorithm.cpp" \
    -o ./src/components/customAlghoritm.mjs \
    -s ENVIRONMENT='web' \
    -s WASM=0 \
    -s EXPORTED_RUNTIME_METHODS="['FS','ccall']" \
    -s EXPORTED_FUNCTIONS=_delete_background,_convert_to_png,_convert_to_jpg,_convert_to_bmp \
    -s FORCE_FILESYSTEM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s USE_ES6_IMPORT_META=0 \
    -s EXPORT_NAME='wasmModule' \
    -O1
echo "WASM module is built!"
npm run build
