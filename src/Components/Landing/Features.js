import { Lock, Trophy, Target } from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Picks Hidden Until Lock',
    description: 'No copying. No last-second cheating. Everyone locks before kickoff.',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboards',
    description: 'Real-time rankings after each game so standings always feel competitive.',
  },
  {
    icon: Target,
    title: 'Game + Prop Questions',
    description: 'Winners, over/unders, and custom props — more than basic bracket picks.',
  },
];

export function Features() {
  return (
    <section className="max-w-screen-2xl mx-auto px-6 py-20 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white text-xl">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}