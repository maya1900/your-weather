import { type Theme, isDarkTheme } from '@/utils/weatherTheme';

export function LoadingSkeleton({ theme }: { theme: Theme }) {
  const dark = isDarkTheme(theme);
  const bar = dark ? 'bg-white/10' : 'bg-stone-900/10';

  return (
    <section className="px-6 md:px-10 pt-20 md:pt-24 max-w-[1280px] mx-auto animate-pulse">
      <div className={`h-3 w-72 ${bar} rounded`} />
      <div className={`h-12 w-40 mt-7 ${bar} rounded`} />
      <div className={`h-3 w-40 mt-3 ${bar} rounded`} />
      <div className={`h-48 md:h-64 w-64 md:w-96 mt-4 ${bar} rounded`} />
      <div className={`h-6 w-72 mt-3 ${bar} rounded`} />
      <div className={`h-3 w-full mt-12 ${bar} rounded`} />
      <div className="grid grid-cols-5 gap-4 mt-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className={`h-3 w-12 ${bar} rounded`} />
            <div className={`h-8 w-8 ${bar} rounded`} />
            <div className={`h-5 w-16 ${bar} rounded`} />
          </div>
        ))}
      </div>
    </section>
  );
}
