'use client'

import { AnimatePresence, motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0},
  exit: { opacity: 0, x: -20 },
};

export default function MotionWrapper({ children }) {
  return (
    <motion.div>
      {children}
    </motion.div>
  )
}