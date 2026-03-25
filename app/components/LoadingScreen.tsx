"use client";

import { AnimatePresence, motion } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 3 : 0 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? "all" : "none",
          transition: "opacity 0.6s ease",
        }}
      >
        <svg
          width="240"
          height="150"
          viewBox="0 0 163 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .pf-ghost {
              fill: none;
              stroke: rgba(255,255,255,0);
              stroke-width: 1.5;
              stroke-linejoin: round;
            }
            .pf-runner {
              fill: none;
              stroke: white;
              stroke-width: 2.5;
              stroke-linejoin: round;
              stroke-linecap: round;
            }
            .pf-runner-p {
              stroke-dasharray: 120 480;
              stroke-dashoffset: 120;
              animation: pfRunP 2s linear 0s infinite;
            }
            .pf-runner-f {
              stroke-dasharray: 100 400;
              stroke-dashoffset: 100;
              animation: pfRunF 2.0s linear 1.2s infinite;
            }
            @keyframes pfRunP {
              from { stroke-dashoffset:  120; }
              to   { stroke-dashoffset: -480; }
            }
            @keyframes pfRunF {
              from { stroke-dashoffset:  100; }
              to   { stroke-dashoffset: -400; }
            }
          `}</style>

          {/* Fills fantasmas */}
          <path
            d="M4 93.0909L19.4545 0H59.6364C66.5455 0 72.3636 1.36364 77.0909 4.09091C81.8182 6.81818 85.2121 10.6515 87.2727 15.5909C89.3333 20.5303 89.8182 26.303 88.7273 32.9091C87.6364 39.6364 85.2121 45.4394 81.4546 50.3182C77.7273 55.1667 72.9697 58.9091 67.1818 61.5455C61.4242 64.1515 54.9697 65.4545 47.8182 65.4545H23.8182L27.0909 45.8182H46C49.0303 45.8182 51.697 45.303 54 44.2727C56.303 43.2121 58.1667 41.7273 59.5909 39.8182C61.0152 37.8788 61.9394 35.5758 62.3636 32.9091C62.7879 30.2424 62.5909 27.9697 61.7727 26.0909C60.9848 24.1818 59.6212 22.7273 57.6818 21.7273C55.7727 20.697 53.3333 20.1818 50.3636 20.1818H41.4545L29.2727 93.0909H4Z"
            fill="white"
            fillOpacity="0.05"
          />
          <path
            d="M77.76 93.0909L93.2145 0H158.669L155.215 20.3636H115.033L112.487 36.3636H148.669L145.215 56.7273H109.033L103.033 93.0909H77.76Z"
            fill="white"
            fillOpacity="0.05"
          />

          {/* Contornos fantasma */}
          <path
            className="pf-ghost"
            d="M4 93.0909L19.4545 0H59.6364C66.5455 0 72.3636 1.36364 77.0909 4.09091C81.8182 6.81818 85.2121 10.6515 87.2727 15.5909C89.3333 20.5303 89.8182 26.303 88.7273 32.9091C87.6364 39.6364 85.2121 45.4394 81.4546 50.3182C77.7273 55.1667 72.9697 58.9091 67.1818 61.5455C61.4242 64.1515 54.9697 65.4545 47.8182 65.4545H23.8182L27.0909 45.8182H46C49.0303 45.8182 51.697 45.303 54 44.2727C56.303 43.2121 58.1667 41.7273 59.5909 39.8182C61.0152 37.8788 61.9394 35.5758 62.3636 32.9091C62.7879 30.2424 62.5909 27.9697 61.7727 26.0909C60.9848 24.1818 59.6212 22.7273 57.6818 21.7273C55.7727 20.697 53.3333 20.1818 50.3636 20.1818H41.4545L29.2727 93.0909H4Z"
          />
          <path
            className="pf-ghost"
            d="M77.76 93.0909L93.2145 0H158.669L155.215 20.3636H115.033L112.487 36.3636H148.669L145.215 56.7273H109.033L103.033 93.0909H77.76Z"
          />

          {/* Barra de luz — P */}
          <path
            className="pf-runner pf-runner-p"
            d="M4 93.0909L19.4545 0H59.6364C66.5455 0 72.3636 1.36364 77.0909 4.09091C81.8182 6.81818 85.2121 10.6515 87.2727 15.5909C89.3333 20.5303 89.8182 26.303 88.7273 32.9091C87.6364 39.6364 85.2121 45.4394 81.4546 50.3182C77.7273 55.1667 72.9697 58.9091 67.1818 61.5455C61.4242 64.1515 54.9697 65.4545 47.8182 65.4545H23.8182L27.0909 45.8182H46C49.0303 45.8182 51.697 45.303 54 44.2727C56.303 43.2121 58.1667 41.7273 59.5909 39.8182C61.0152 37.8788 61.9394 35.5758 62.3636 32.9091C62.7879 30.2424 62.5909 27.9697 61.7727 26.0909C60.9848 24.1818 59.6212 22.7273 57.6818 21.7273C55.7727 20.697 53.3333 20.1818 50.3636 20.1818H41.4545L29.2727 93.0909H4Z"
          />

          {/* Barra de luz — F */}
          <path
            className="pf-runner pf-runner-f"
            d="M77.76 93.0909L93.2145 0H158.669L155.215 20.3636H115.033L112.487 36.3636H148.669L145.215 56.7273H109.033L103.033 93.0909H77.76Z"
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}

/*
  USO NO SEU PROJETO NEXT.JS
  ─────────────────────────────────────────────────────
  O componente recebe `isLoading: boolean`.
  Enquanto true  → aparece na tela e anima em loop infinito.
  Quando false   → fade out suave (0.6s) e some.

  EXEMPLO com fetch de dados:

    "use client";
    import { useState, useEffect } from "react";
    import LoadingScreen from "@/components/LoadingScreen";

    export default function Page() {
      const [isLoading, setIsLoading] = useState(true);
      const [data, setData] = useState(null);

      useEffect(() => {
        fetch("/api/seus-dados")
          .then((res) => res.json())
          .then((data) => {
            setData(data);
            setIsLoading(false);
          });
      }, []);

      return (
        <>
          <LoadingScreen isLoading={isLoading} />
          {data && <SuaPagina data={data} />}
        </>
      );
    }
  ─────────────────────────────────────────────────────
*/
