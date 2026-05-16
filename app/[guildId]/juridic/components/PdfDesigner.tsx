'use client';

import { useEffect, useRef } from 'react';
import { Template, BLANK_A4_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { text, image, barcodes, line, rectangle, ellipse, svg, table, multiVariableText } from '@pdfme/schemas';

const defaultTemplate: Template = {
  basePdf: BLANK_A4_PDF,
  schemas: [[]],
};

export default function PdfDesigner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const designerRef = useRef<Designer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    designerRef.current = new Designer({
      domContainer: containerRef.current,
      template: defaultTemplate,
      plugins: {
        Text: text,
        MultiVariableText: multiVariableText,
        Image: image,
        QRCode: barcodes.qrcode,
        EAN13: barcodes.ean13,
        Line: line,
        Rectangle: rectangle,
        Ellipse: ellipse,
        SVG: svg,
        Table: table,
      },
    });

    return () => {
      designerRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
