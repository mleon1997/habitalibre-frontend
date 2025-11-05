import { motion } from "framer-motion";
import { ArrowRightCircle } from "lucide-react";

export default function Hero() {
  // Función para hacer scroll al simulador
  const scrollToSimulator = () => {
    const el = document.querySelector("#simulador");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl shadow-lg mx-auto max-w-6xl my-8"
      style={{
        background: "linear-gradient(135deg, #3B5BFF 0%, #7A64FF 100%)",
      }}
    >
      <div className="text-center py-16 px-6 text-white relative z-10">
        <motion.img
          src="/logo-hl.png"
          alt="HabitaLibre"
          className="mx-auto mb-6 drop-shadow-lg"
          style={{ width: 180, height: "auto" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h1
          className="text-4xl font-extrabold mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          HabitaLibre
        </motion.h1>

        <motion.p
          className="text-lg opacity-90 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Tu camino fácil hacia tu vivienda propia 🏠
        </motion.p>

        <motion.button
          onClick={scrollToSimulator}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-indigo-50 flex items-center gap-2 mx-auto"
        >
          <span>Comenzar simulación</span>
          <ArrowRightCircle size={20} />
        </motion.button>
      </div>

      {/* Fondo con efecto de burbujas */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="200" cy="200" r="180" fill="url(#grad)" />
          <defs>
            <radialGradient id="grad">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}

