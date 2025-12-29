export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-zinc-950/50 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400">
            Playoff Pick'ems
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <button className="hover:text-white transition-colors">
              Privacy
            </button>
            <button className="hover:text-white transition-colors">
              Terms
            </button>
            <span>© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
