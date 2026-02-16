interface BlogHeaderProps {
  totalCount: number;
}

export const BlogHeader = ({ totalCount }: BlogHeaderProps) => {
  return (
    <header className="relative w-full min-h-[50vh] md:min-h-[45vh] flex items-center justify-center mb-12 md:mb-16 overflow-hidden bg-gradient-to-br from-[#020806] via-[#1A4D3E] to-[#020806]">
      {/* Decorative gold orbs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C5A059] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(197,160,89,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(197,160,89,0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <div className="w-16 h-1 bg-[#C5A059] mx-auto mb-6" />
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          INSIGHTS & STRATEGIES
        </h1>
        <p className="mt-4 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
          Expert perspectives on retirement, tax efficiency, and wealth protection.
        </p>
      </div>
    </header>
  );
};
