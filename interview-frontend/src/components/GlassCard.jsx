export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-2xl border border-white/20 
      rounded-3xl shadow-2xl p-8 transition duration-300 hover:scale-[1.02] ${className}`}
    >
      {children}
    </div>
  );
}