'use client';

import dynamic from 'next/dynamic';

const PdfDesigner = dynamic(() => import('./components/PdfDesigner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      Carregando editor...
    </div>
  ),
});

export default function JuridicPage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PdfDesigner />
    </div>
  );
}
