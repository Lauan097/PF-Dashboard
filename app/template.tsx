'use client';

import { motion, AnimatePresence } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { useContext, useMemo } from "react";

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

const fadeVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const isDashboardRoute = (pathname: string) => /^\/\d{17,19}/.test(pathname);

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isDashboardRoute(pathname)) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={fadeVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="min-h-screen w-full"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
