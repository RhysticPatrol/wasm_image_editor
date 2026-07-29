use wasm_bindgen::prelude::*;
use image::{ImageBuffer, Rgba};
use web_sys::console;

#[wasm_bindgen]
pub fn process_image(image_data: &[u8], width: u32, height: u32, filter: &str) -> Vec<u8> {
    console::log_1(&format!("Processing image {}x{} with filter '{}'", width, height, filter).into());

    let mut img = ImageBuffer::<Rgba<u8>, Vec<u8>>::from_raw(width, height, image_data.to_vec())
        .expect("Failed to create ImageBuffer from raw data");

    match filter {
        "grayscale" => {
            image::imageops::colorops::grayscale(&img)
                .pixels()
                .flat_map(|p| vec![p[0], p[0], p[0], 255])
                .collect()
        }
        "invert" => {
            image::imageops::colorops::invert(&mut img);
            img.into_raw()
        }
        "sepia" => {
            for pixel in img.pixels_mut() {
                let r = pixel[0] as f32;
                let g = pixel[1] as f32;
                let b = pixel[2] as f32;

                let tr = (r * 0.393 + g * 0.769 + b * 0.189).min(255.0) as u8;
                let tg = (r * 0.349 + g * 0.686 + b * 0.168).min(255.0) as u8;
                let tb = (r * 0.272 + g * 0.534 + b * 0.131).min(255.0) as u8;

                pixel[0] = tr;
                pixel[1] = tg;
                pixel[2] = tb;
            }
            img.into_raw()
        }
        _ => {
            console::log_1(&"Unknown filter, returning original".into());
            img.into_raw()
        }
    }
}
