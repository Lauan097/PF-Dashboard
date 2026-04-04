'use client';

import { motion } from 'framer-motion';

export default function MotionWrapper({ children }) {
  return (
    <motion.div>
      {children}
    </motion.div>
  )
}