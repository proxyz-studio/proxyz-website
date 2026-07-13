// src/features/mira-class/motion.ts
//
// Shared Framer-Motion variants for the MIRA Workshop page. Kept out of the
// component files so fast-refresh stays happy (component files export only
// components).

import { EASE_OUT_EXPO_TUPLE } from './theme';

const OUT = EASE_OUT_EXPO_TUPLE;

export const RISE = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: OUT } },
};

export const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
