"use client"

import { motion } from "framer-motion"

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
}

const pageTransition = {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1],
}

export function PageTransition({ children, className = "" }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Stagger container for children
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
}

export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

export function StaggerContainer({ children, className = "" }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = "" }) {
    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    )
}
