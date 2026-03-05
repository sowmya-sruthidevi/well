export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#1f2937] text-white relative overflow-hidden">

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}