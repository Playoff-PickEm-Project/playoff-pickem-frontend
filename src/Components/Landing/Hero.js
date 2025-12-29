export function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-20 pb-32 md:pt-32 md:pb-40">
      <div className="text-center space-y-8">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-emerald-500/30 text-emerald-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          Now in Beta
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl text-white max-w-4xl mx-auto leading-tight">
            Out-predict your friends. Own the playoffs.
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto"></div>
        </div>

        {/* Subheadline */}
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Create private leagues, answer game and prop questions, and climb the leaderboard — with picks hidden until kickoff.
        </p>
      </div>
    </section>
  );
}