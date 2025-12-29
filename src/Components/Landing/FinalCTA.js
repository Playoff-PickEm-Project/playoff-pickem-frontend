export function FinalCTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
      <div className="relative rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-12 md:p-16 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative text-center space-y-6">
          <h2 className="text-4xl md:text-5xl text-white">
            Ready to run the playoffs?
          </h2>
          <p className="text-xl text-gray-400">
            Free • No ads • Just bragging rights
          </p>
        </div>
      </div>
    </section>
  );
}