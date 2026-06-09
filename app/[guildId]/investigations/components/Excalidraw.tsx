"use client";

import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { io, Socket } from "socket.io-client";

interface ExcalidrawComponentProps {
  investigationId: string;
  userId: string;
  initialCanvasData: string | null;
  onCanvasChange?: (canvasData: string) => void;
}

export default function ExcalidrawComponent({
  investigationId,
  userId,
  initialCanvasData,
  onCanvasChange
}: ExcalidrawComponentProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const lastReceivedRef = useRef<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onCanvasChangeRef = useRef(onCanvasChange);
  const excalidrawAPIRef = useRef(excalidrawAPI);
  const latestSerializedRef = useRef<string>("");
  const lastLoggedRef = useRef<{ elementsCount: number; imagesCount: number; textCount: number } | null>(null);

  const isRemoteUpdateRef = useRef<boolean>(false);
  const lastReceivedVersionsRef = useRef<Map<string, { version: number; isDeleted: boolean }>>(new Map());
  const lastReceivedFilesKeysRef = useRef<Set<string>>(new Set());
  const alreadySentOrReceivedFilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onCanvasChangeRef.current = onCanvasChange;
  }, [onCanvasChange]);

  useEffect(() => {
    excalidrawAPIRef.current = excalidrawAPI;
  }, [excalidrawAPI]);

  useEffect(() => {
    if (initialCanvasData) {
      try {
        const parsed = JSON.parse(initialCanvasData);

        let savedViewport: any = null;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(`excalidraw_viewport_${investigationId}`);
          if (stored) {
            try {
              savedViewport = JSON.parse(stored);
            } catch (e) {
              console.error("Erro ao parsear viewport do localStorage:", e);
            }
          }
        }

        const appStateInit: any = { theme: "dark" };
        if (savedViewport && savedViewport.zoom) {
          appStateInit.zoom = savedViewport.zoom;
          appStateInit.scrollX = savedViewport.scrollX;
          appStateInit.scrollY = savedViewport.scrollY;
          appStateInit.scrollToContent = false;
        } else if (parsed.appState && parsed.appState.zoom) {
          appStateInit.zoom = parsed.appState.zoom;
          appStateInit.scrollX = parsed.appState.scrollX;
          appStateInit.scrollY = parsed.appState.scrollY;
          appStateInit.scrollToContent = false;
        } else {
          appStateInit.scrollToContent = true;
        }

        setTimeout(() => {
          setInitialData({
            elements: parsed.elements || [],
            appState: appStateInit,
            files: parsed.files || {}
          });
        }, 0);
        lastReceivedRef.current = initialCanvasData;
        latestSerializedRef.current = initialCanvasData;

        const versionMap = new Map<string, { version: number; isDeleted: boolean }>();
        for (const el of parsed.elements || []) {
          versionMap.set(el.id, { version: el.version, isDeleted: !!el.isDeleted });
        }
        lastReceivedVersionsRef.current = versionMap;

        const filesKeys = Object.keys(parsed.files || {});
        lastReceivedFilesKeysRef.current = new Set(filesKeys);
        alreadySentOrReceivedFilesRef.current = new Set(filesKeys);

        const activeElements = (parsed.elements || []).filter((el: any) => !el.isDeleted);
        lastLoggedRef.current = {
          elementsCount: activeElements.length,
          imagesCount: activeElements.filter((el: any) => el.type === "image").length,
          textCount: activeElements.filter((el: any) => el.type === "text").length
        };
      } catch (err) {
        console.error("Erro ao parsear dados iniciais do canvas:", err);
        lastReceivedVersionsRef.current = new Map();
        lastReceivedFilesKeysRef.current = new Set();
        alreadySentOrReceivedFilesRef.current = new Set();
      }
    } else {
      lastReceivedVersionsRef.current = new Map();
      lastReceivedFilesKeysRef.current = new Set();
      alreadySentOrReceivedFilesRef.current = new Set();
      lastLoggedRef.current = { elementsCount: 0, imagesCount: 0, textCount: 0 };
    }
    setTimeout(() => {
      setInitialLoaded(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!initialLoaded) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5500"
        : "https://ap-ipflegacy.discloud.app");

    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      auth: { userId }
    });

    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("investigation:join", { id: investigationId });
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", joinRoom);

    socket.on("investigation:canvasUpdated", ({ canvasData }: { canvasData: string }) => {
      if (!canvasData) return;
      try {
        if (canvasData === lastReceivedRef.current) return;

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
          debounceTimeoutRef.current = null;
        }
        
        lastReceivedRef.current = canvasData;
        latestSerializedRef.current = canvasData;
        const parsed = JSON.parse(canvasData);

        const versionMap = new Map<string, { version: number; isDeleted: boolean }>();
        for (const el of parsed.elements || []) {
          versionMap.set(el.id, { version: el.version, isDeleted: !!el.isDeleted });
        }
        lastReceivedVersionsRef.current = versionMap;
        
        const incomingFiles = parsed.files || {};
        const incomingKeys = Object.keys(incomingFiles);

        for (const fileId of incomingKeys) {
          alreadySentOrReceivedFilesRef.current.add(fileId);
        }

        const currentFiles = excalidrawAPIRef.current?.getFiles ? excalidrawAPIRef.current.getFiles() : {};
        lastReceivedFilesKeysRef.current = new Set([
          ...Object.keys(currentFiles),
          ...incomingKeys
        ]);

        const currentAPI = excalidrawAPIRef.current;
        if (currentAPI) {
          isRemoteUpdateRef.current = true;

          if (incomingKeys.length > 0) {
            currentAPI.addFiles(Object.values(incomingFiles));
          }

          currentAPI.updateScene({
            elements: parsed.elements || [],
            appState: { 
              ...currentAPI.getAppState(), 
              theme: "dark"
            }
          });
          
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 50);
        }

        if (onCanvasChangeRef.current) {
          onCanvasChangeRef.current(canvasData);
        }
      } catch (err) {
        console.error("Erro ao aplicar canvasUpdated:", err);
      }
    });

    return () => {
      if (latestSerializedRef.current && latestSerializedRef.current !== lastReceivedRef.current) {
        socket.emit("investigation:canvasUpdate", {
          id: investigationId,
          canvasData: latestSerializedRef.current
        });
        if (onCanvasChangeRef.current) {
          onCanvasChangeRef.current(latestSerializedRef.current);
        }
      }
      socket.emit("investigation:leave", { id: investigationId });
      socket.disconnect();
    };
  }, [investigationId, userId, initialLoaded]);

  const handleCanvasChange = (elements: readonly any[], appState: any) => {
    if (isRemoteUpdateRef.current) return;
    if (!socketRef.current || !excalidrawAPI) return;

    const elementsData = elements;
    const filesData = excalidrawAPI.getFiles ? excalidrawAPI.getFiles() : {};

    if (typeof window !== "undefined" && appState && appState.zoom) {
      localStorage.setItem(
        `excalidraw_viewport_${investigationId}`,
        JSON.stringify({
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY
        })
      );
    }

    const hasCanvasChanged = () => {
      if (elementsData.length !== lastReceivedVersionsRef.current.size) return true;

      for (const el of elementsData) {
        const match = lastReceivedVersionsRef.current.get(el.id);
        if (!match) return true;
        if (el.version !== match.version) return true;
        if (!!el.isDeleted !== match.isDeleted) return true;
      }

      const newKeys = Object.keys(filesData || {});
      if (newKeys.length !== lastReceivedFilesKeysRef.current.size) return true;
      for (const key of newKeys) {
        if (!lastReceivedFilesKeysRef.current.has(key)) return true;
      }

      return false;
    };

    const payloadComplete = {
      elements: elementsData,
      appState: {
        zoom: appState.zoom,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      },
      files: filesData
    };

    const serializedComplete = JSON.stringify(payloadComplete);
    latestSerializedRef.current = serializedComplete;

    if (!hasCanvasChanged()) {
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        const newFilesObj: any = {};
        for (const [fileId, fileData] of Object.entries(filesData)) {
          if (!alreadySentOrReceivedFilesRef.current.has(fileId)) {
            newFilesObj[fileId] = fileData;
          }
        }

        const payloadSocket = {
          elements: elementsData,
          appState: {
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
          },
          files: newFilesObj
        };

        const serializedSocket = JSON.stringify(payloadSocket);

        socketRef.current.emit("investigation:canvasUpdate", {
          id: investigationId,
          canvasData: serializedSocket
        });
        
        lastReceivedRef.current = serializedComplete;
        
        const versionMap = new Map<string, { version: number; isDeleted: boolean }>();
        for (const el of elementsData) {
          versionMap.set(el.id, { version: el.version, isDeleted: !!el.isDeleted });
        }
        lastReceivedVersionsRef.current = versionMap;
        
        const allKeys = Object.keys(filesData);
        lastReceivedFilesKeysRef.current = new Set(allKeys);
        
        for (const fileId of Object.keys(newFilesObj)) {
          alreadySentOrReceivedFilesRef.current.add(fileId);
        }
        
        if (onCanvasChangeRef.current) {
          onCanvasChangeRef.current(serializedComplete);
        }

        const activeElements = elementsData.filter((el: any) => !el.isDeleted);
        const elementsCount = activeElements.length;
        const imagesCount = activeElements.filter((el: any) => el.type === "image").length;
        const textCount = activeElements.filter((el: any) => el.type === "text").length;

        if (lastLoggedRef.current) {
          const diffElements = elementsCount - lastLoggedRef.current.elementsCount;
          const diffImages = imagesCount - lastLoggedRef.current.imagesCount;
          const diffText = textCount - lastLoggedRef.current.textCount;

          if (diffElements !== 0 || diffImages !== 0 || diffText !== 0) {
            let details = "Realizou alterações no quadro:";
            const parts: string[] = [];
            if (diffImages > 0) parts.push(`adicionou ${diffImages} imagem(ns)`);
            else if (diffImages < 0) parts.push(`removeu ${Math.abs(diffImages)} imagem(ns)`);

            if (diffText > 0) parts.push(`adicionou ${diffText} texto(s)`);
            else if (diffText < 0) parts.push(`removeu ${Math.abs(diffText)} texto(s)`);

            const diffOthers = diffElements - diffImages - diffText;
            if (diffOthers > 0) parts.push(`adicionou ${diffOthers} elemento(s) visual(is)`);
            else if (diffOthers < 0) parts.push(`removeu ${Math.abs(diffOthers)} elemento(s) visual(is)`);

            if (parts.length > 0) {
              details += " " + parts.join(", ");
              socketRef.current.emit("investigation:logBoardEdit", {
                id: investigationId,
                details
              });
              lastLoggedRef.current = { elementsCount, imagesCount, textCount };
            }
          }
        } else {
          lastLoggedRef.current = { elementsCount, imagesCount, textCount };
        }
      }
    }, 150);
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      {initialLoaded && (
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData || undefined}
          theme="dark"
          langCode="pt-BR"
          onChange={handleCanvasChange}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
              saveAsImage: false,
              toggleTheme: false,
            },
          }}
        />
      )}
    </div>
  );
}