#include "Bitmap_Vall_Gyak/Greyscale Document Colour Filter/Image.h"

#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.h"

#define STBI_MSC_SECURE_CRT
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb/stb_image_write.h"

extern "C" {
	int delete_background(char* input_path) {
		char* path = input_path;
		Image img(path);
		img.DeleteBackground();
		img.Write("bmp_out.bmp", true);
		return 1;
	}
}

extern "C" {
	int convert_to_png(char* input_path) {
		int width, height, bpp;
		uint8_t* rgb_image = stbi_load(input_path, &width, &height, &bpp, 3);
    stbi_write_png("png_out.png", width, height, 3, rgb_image, width*3);
		return 1;
	}
}

extern "C" {
	int convert_to_jpg(char* input_path) {
		int width, height, bpp;
		uint8_t* rgb_image = stbi_load(input_path, &width, &height, &bpp, 3);
    stbi_write_jpg("jpg_out.jpg", width, height, 3, rgb_image, 100);
		return 1;
	}
}

extern "C" {
	int convert_to_bmp(char* input_path) {
		int width, height, bpp;
		uint8_t* rgb_image = stbi_load(input_path, &width, &height, &bpp, 3);
		stbi_write_bmp("bmp_out.bmp", width, height, 3, rgb_image);
		return 1;
	}
}

