const stats = [
  {
    value: '500+',
    label: 'Leagues Created',
  },
  {
    value: 'No Spoilers',
    label: 'Picks Hidden Until Lock',
  },
  {
    value: 'Mobile-First',
    label: 'Built for Game Day',
  },
];

export function Stats() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="text-4xl md:text-5xl text-emerald-400">
              {stat.value}
            </div>
            <div className="text-gray-400 text-lg">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}