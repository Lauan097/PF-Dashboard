'use client';

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function TldrawComponent() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw persistenceKey="investigations-canvas" />
    </div>
  );
}