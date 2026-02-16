"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared transition presets
// ---------------------------------------------------------------------------

const springSmooth = { type: "spring", stiffness: 80, damping: 20 } as const;
const easeOut = { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as const;

// ---------------------------------------------------------------------------
// Fade-up (staggered children)
// ---------------------------------------------------------------------------

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: easeOut },
};

export function FadeUpStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Simple fade-in from bottom (single element)
// ---------------------------------------------------------------------------

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...easeOut, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Scale-in card with hover lift
// ---------------------------------------------------------------------------

export function HoverCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -6, transition: springSmooth }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Animated counter (for stats)
// ---------------------------------------------------------------------------

export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// Marquee / infinite horizontal scroll
// ---------------------------------------------------------------------------

export function Marquee({
  children,
  className,
  speed = 30,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gradient blob (decorative)
// ---------------------------------------------------------------------------

export function GradientBlob({
  className,
}: {
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute rounded-full blur-[120px] opacity-30",
        className
      )}
      animate={{
        scale: [1, 1.15, 1],
        rotate: [0, 90, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
