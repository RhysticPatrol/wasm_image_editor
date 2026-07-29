import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, History, Wand2 } from 'lucide-react';
import initWasm, { process_image } from 'rust-wasm';
import { initDb, logEdit, getEditHistory } from './db';
import './App.css'; // Just keeping base import, we'll style in index.css

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [filename, setFilename] = useState('');
  const [imgData, setImgData] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    // Initialize Wasm and SQL.js on mount
    async function setup() {
      try {
        await initWasm();
        setWasmReady(true);
        await initDb();
        refreshHistory();
      } catch (err) {
        console.error("Failed to initialize WASM or DB:", err);
      }
    }
    setup();
  }, []);

  const refreshHistory = () => {
    setHistory(getEditHistory());
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        setImgData(imageData);
        setImageLoaded(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (filterName: string) => {
    if (!wasmReady || !imgData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const start = performance.now();
    
    // Process image using Rust WebAssembly!
    const rawData = new Uint8Array(imgData.data.buffer);
    const result = process_image(rawData, canvas.width, canvas.height, filterName);
    
    const end = performance.now();
    const executionTimeMs = end - start;

    // Put data back onto canvas
    const newImgData = new ImageData(new Uint8ClampedArray(result), canvas.width, canvas.height);
    ctx.putImageData(newImgData, 0, 0);

    // Log to SQL.js
    logEdit(filename, filterName, canvas.width, canvas.height, executionTimeMs);
    refreshHistory();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><Wand2 className="icon" /> Wasm Image Engine</h1>
        <p>Blazing fast client-side image editing powered by Rust and WebAssembly.</p>
      </header>

      <main className="main-content">
        <div className="editor-panel">
          <div className="upload-box">
            <label htmlFor="file-upload" className="custom-file-upload">
              <Upload size={20} /> Upload Image
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef} className={imageLoaded ? 'active' : ''}></canvas>
            {!imageLoaded && (
              <div className="placeholder">
                <ImageIcon size={48} />
                <p>No image selected</p>
              </div>
            )}
          </div>

          <div className="filter-controls">
            <button onClick={() => applyFilter('grayscale')} disabled={!imageLoaded || !wasmReady}>Grayscale</button>
            <button onClick={() => applyFilter('sepia')} disabled={!imageLoaded || !wasmReady}>Sepia</button>
            <button onClick={() => applyFilter('invert')} disabled={!imageLoaded || !wasmReady}>Invert</button>
          </div>
        </div>

        <aside className="history-panel">
          <h2><History className="icon" /> Edit History</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Filter</th>
                  <th>Time (ms)</th>
                  <th>Dims</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">No edits yet.</td>
                  </tr>
                ) : (
                  history.map(row => (
                    <tr key={row.id}>
                      <td title={row.filename}>{row.filename.length > 15 ? row.filename.substring(0,12)+'...' : row.filename}</td>
                      <td>{row.filter}</td>
                      <td className="highlight">{row.execution_time_ms.toFixed(2)}</td>
                      <td>{row.width}x{row.height}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
