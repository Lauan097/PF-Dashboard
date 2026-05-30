'use client';

import dynamic from 'next/dynamic';
import { Button, Modal } from '@heroui/react';

const ExcalidrawComponent = dynamic(() => import('./components/Excalidraw'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      Carregando editor...
    </div>
  ),
});

export default function InvestigationsPage() {
  return (
    <div className="p-6">
      <Modal>
        <Button variant="primary">Abrir Editor</Button>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container size="full">
            <Modal.Dialog className="h-full flex flex-col">
              <Modal.Body className="p-0 flex-1 overflow-hidden">
                <ExcalidrawComponent />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}