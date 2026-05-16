'use client';

import { motion } from "framer-motion";
import { variants } from "@/types/animate";

export default function RecruitmentPage() {
  return (
    <motion.div
      className="p-6"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={variants.transition}
    >
      Página de Recrutamento
    </motion.div>
  );
}