// src/components/LiaCoach.jsx
import { motion } from "framer-motion";

export default function LiaCoach({ mood = "neutral", title, message, hint }) {
  const moodMap = {
    happy: { bg: "from-emerald-50 to-white", dot: "bg-emerald-500", face: "😊" },
    think: { bg: "from-indigo-50 to-white", dot: "bg-indigo-500", face: "🤔" },
    warn:  { bg: "from-amber-50 to-white", dot: "bg-amber-500", face: "⚠️" },
    sad:   { bg: "from-rose-50 to-white", dot: "bg-rose-500", face: "😕" },
    neutral:{bg: "from-slate-50 to-white", dot: "bg-slate-400", face: "🙂" },
  };
  const m = moodMap[mood] || moodMap.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border shadow-sm p-3 bg-gradient-to-br ${m.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-lg ${m.dot} text-white`}>
          {m.face}
        </div>
        <div className="flex-1">
          {title && <div className="font-semibold text-slate-800">{title}</div>}
          {message && <div className="text-sm text-slate-700 mt-0.5">{message}</div>}
          {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
        </div>
      </div>
    </motion.div>
  );
}
