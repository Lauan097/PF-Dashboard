'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

export default function ExcalidrawComponent() {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      <Excalidraw
        theme="dark"
        langCode="pt-BR"
      />
    </div>
  );
}