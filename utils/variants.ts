export const VariantsPageTransition = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.165, 0.84, 0.44, 1.0] as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
      ease: [0.36, 0.66, 0.04, 1] as const,
    },
  },
};