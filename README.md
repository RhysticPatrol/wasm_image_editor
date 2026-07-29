# WebAssembly Image Editor

A blazingly fast, purely client-side image editing application built with **Rust**, **WebAssembly**, **React/TypeScript**, and **SQL.js**. 

---

## Architecture Overview

1. **Rust + WebAssembly Module (`rust-wasm/`)**: We utilize the powerful `image` crate in Rust to perform high-speed pixel manipulations (Grayscale, Sepia, Invert). Using `wasm-bindgen`, this Rust code is compiled down into a lightweight `.wasm` module.
2. **React + TypeScript Frontend (`web-ui/`)**: A modern, glassmorphic UI built with Vite. It handles local file uploads via an HTML5 canvas and streams the raw byte array directly into the Wasm module.
3. **SQL.js Edit History**: To track every action you take, the app leverages `sql.js` (SQLite running in WebAssembly) to log processing metadata (execution time, filter name, image dimensions) securely in the browser's memory.

---

## Getting Started

### Prerequisites
- Node.js & npm
- Rust (`rustup` / `cargo`)
- `wasm-pack`

### 1. Build the Rust WebAssembly Module

```bash
cd rust-wasm
wasm-pack build --target web
cd ..
```

### 2. Start the Frontend

```bash
cd web-ui
npm install
npm run dev
```

The application will launch on your local host!

---

## Features

- ⚡️ **Zero-Latency Processing**: Editing happens locally on your hardware. No images are ever uploaded to a remote server.
- 🎨 **Modern Aesthetics**: Interactive hover effects, blurred backdrops, and glowing gradients.
- 💾 **Client-Side Database**: See exactly how fast WebAssembly is by checking the execution time in the edit history table below the editor.

---

## License
MIT License
