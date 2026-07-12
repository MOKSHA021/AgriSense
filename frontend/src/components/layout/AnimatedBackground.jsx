import { motion } from "framer-motion";

/**
 * AnimatedBackground — Light Farm Theme
 *
 * A calm, professional background for AgriSense:
 *  • Warm cream (#F7F4EE) base
 *  • Subtle SVG wheat / leaf tile pattern (very low opacity)
 *  • 3 soft green gradient orbs that drift slowly
 *  • No flashy colors — suitable for a professional AgriTech platform
 */

// Base64-encoded tiny SVG tile — a minimal wheat stalk + leaf shape
// rendered at 64×64px, repeated as a CSS background pattern
const WHEAT_TILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <!-- Wheat stalk -->
  <line x1="32" y1="56" x2="32" y2="12" stroke="%232D6A4F" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
  <!-- Grain head left -->
  <ellipse cx="27" cy="16" rx="4.5" ry="2.2" fill="%2352B788" opacity="0.28" transform="rotate(-35 27 16)"/>
  <!-- Grain head right -->
  <ellipse cx="37" cy="18" rx="4.5" ry="2.2" fill="%2352B788" opacity="0.28" transform="rotate(35 37 18)"/>
  <!-- Grain head center -->
  <ellipse cx="32" cy="12" rx="3.5" ry="1.8" fill="%232D6A4F" opacity="0.22"/>
  <!-- Small leaf -->
  <path d="M32 38 Q22 32 24 24 Q30 30 32 38Z" fill="%2352B788" opacity="0.18"/>
</svg>
`;

const encodedTile = `data:image/svg+xml,${WHEAT_TILE_SVG.trim().replace(/\n\s*/g, " ")}`;

// Orb configuration — very subtle greens
const ORBS = [
  {
    id: "orb-1",
    color: "rgba(45, 106, 79, 0.10)",   // green-mid
    size: "60vw",
    height: "55vh",
    initial: { top: "-10%", left: "-8%" },
    animate: {
      x: ["0%", "18%", "-12%", "0%"],
      y: ["0%", "22%", "-15%", "0%"],
      scale: [1, 1.12, 0.92, 1],
    },
    duration: 28,
    borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
  },
  {
    id: "orb-2",
    color: "rgba(82, 183, 136, 0.08)",  // green-light
    size: "55vw",
    height: "65vh",
    initial: { top: "20%", right: "-5%" },
    animate: {
      x: ["0%", "-20%", "10%", "0%"],
      y: ["0%", "-18%", "25%", "0%"],
      scale: [1, 0.9, 1.1, 1],
    },
    duration: 34,
    borderRadius: "45% 55% 40% 60% / 55% 40% 60% 45%",
  },
  {
    id: "orb-3",
    color: "rgba(27, 67, 50, 0.07)",    // green-dark, very faint
    size: "70vw",
    height: "50vh",
    initial: { bottom: "-8%", left: "15%" },
    animate: {
      x: ["0%", "15%", "-10%", "0%"],
      y: ["0%", "-20%", "12%", "0%"],
      scale: [0.95, 1.08, 1, 0.95],
    },
    duration: 40,
    borderRadius: "50% 50% 60% 40% / 40% 60% 40% 60%",
  },
];

const AnimatedBackground = () => {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden"
      style={{ backgroundColor: "#F7F4EE" }}
    >
      {/* ── Subtle wheat/leaf tile pattern ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${encodedTile}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "64px 64px",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />

      {/* ── Soft gradient orbs ── */}
      {ORBS.map((orb) => (
        <motion.div
          key={orb.id}
          aria-hidden="true"
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          }}
          style={{
            position: "absolute",
            ...orb.initial,
            width: orb.size,
            height: orb.height,
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 72%)`,
            borderRadius: orb.borderRadius,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Very faint vignette at edges to ground the page ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(27, 67, 50, 0.04) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
