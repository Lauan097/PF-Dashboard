'use client';

import dynamic from "next/dynamic";

const DiscordV2Editor = dynamic(() => import("./EditorV2"), {
  ssr: false,
});

export default function EditorV2Page() {
  return (
    <div className="container mx-auto min-h-screen py-12 max-w-7xl">
      <DiscordV2Editor />
    </div>
  );
}