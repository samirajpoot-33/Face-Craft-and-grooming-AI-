import { motion } from "framer-motion";

/**
 * A reusable wrapper component that applies a scroll-reveal animation to its children.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {string} [props.variant="fadeInUp"] - The animation variant. Options: "fadeInUp", "fadeIn", "scaleIn", "slideInLeft", "slideInRight".
 * @param {number} [props.delay=0] - Delay before the animation starts.
 * @param {number} [props.duration=0.8] - Duration of the animation.
 * @param {string} [props.className=""] - Additional CSS classes.
 * @param {boolean} [props.once=true] - Whether the animation should trigger only once.
 */
export default function ScrollReveal({ 
  children, 
  variant = "fadeInUp", 
  delay = 0, 
  duration = 0.8, 
  className = "",
  once = true 
}) {
  const variants = {
    fadeInUp: {
      initial: { opacity: 0, y: 40 },
      whileInView: { opacity: 1, y: 0 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      whileInView: { opacity: 1, scale: 1 },
    },
    slideInLeft: {
      initial: { opacity: 0, x: -50 },
      whileInView: { opacity: 1, x: 0 },
    },
    slideInRight: {
      initial: { opacity: 0, x: 50 },
      whileInView: { opacity: 1, x: 0 },
    }
  };

  const selectedVariant = variants[variant] || variants.fadeInUp;

  return (
    <motion.div
      initial={selectedVariant.initial}
      whileInView={selectedVariant.whileInView}
      viewport={{ once, margin: "-100px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
