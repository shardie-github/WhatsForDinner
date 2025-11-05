"use client";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

interface InViewRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export default function InViewReveal({
  children,
  direction = "up",
  delay = 0,
}: InViewRevealProps) {
  const variants = {
    up: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  };

  const v = variants[direction];

  return (
    <motion.div
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
