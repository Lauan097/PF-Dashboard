'use client';

import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { useContext, useMemo } from "react";
import { VariantsPageTransition } from "@/utils/variants";

function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frozen = useMemo(() => context, []);

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export default function AnimationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={VariantsPageTransition}
        initial="hidden"
        animate="show"
        exit="exit"
        className="min-h-full w-full"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
