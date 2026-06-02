import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020617]">
      
      {/* Blob 1 */}
      <motion.div
        animate={{
          x: ["0%", "30%", "-20%", "0%"],
          y: ["0%", "-30%", "20%", "0%"],
          rotate: [0, 120, 240, 360],
          scale: [1, 1.3, 0.8, 1],
          backgroundColor: ["#064e3b", "#4c0519", "#0f172a", "#0f3460", "#064e3b"],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vh] blur-[150px] opacity-80"
        style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
      />
      
      {/* Blob 2 */}
      <motion.div
        animate={{
          x: ["-20%", "20%", "0%", "-20%"],
          y: ["20%", "0%", "-30%", "20%"],
          rotate: [360, 240, 120, 0],
          scale: [0.9, 1.2, 1, 0.9],
          backgroundColor: ["#1e1b4b", "#0f3460", "#311b92", "#4c0519", "#1e1b4b"],
        }}
        transition={{ duration: 17, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[0%] w-[60vw] h-[80vh] blur-[160px] opacity-80"
        style={{ borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" }}
      />

      {/* Blob 3 */}
      <motion.div
        animate={{
          x: ["20%", "-20%", "10%", "20%"],
          y: ["-10%", "30%", "-20%", "-10%"],
          rotate: [0, 180, 360],
          scale: [1.1, 0.9, 1.2, 1.1],
          backgroundColor: ["#4c0519", "#311b92", "#064e3b", "#1e1b4b", "#4c0519"],
        }}
        transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[20%] w-[80vw] h-[60vh] blur-[140px] opacity-70"
        style={{ borderRadius: "30% 70% 50% 50% / 60% 40% 60% 40%" }}
      />

      {/* Blob 4 */}
      <motion.div
        animate={{
          x: ["-10%", "10%", "-30%", "-10%"],
          y: ["-30%", "10%", "20%", "-30%"],
          rotate: [0, -180, -360],
          scale: [0.8, 1.1, 0.9, 0.8],
          backgroundColor: ["#311b92", "#064e3b", "#4c0519", "#0f3460", "#311b92"],
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] right-[-10%] w-[70vw] h-[70vh] blur-[150px] opacity-60"
        style={{ borderRadius: "50% 50% 70% 30% / 40% 60% 40% 60%" }}
      />

      {/* Grain overlay for that premium texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
    </div>
  );
};

export default AnimatedBackground;
