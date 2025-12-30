export default function Header({ shopsCount, isTracking }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">🍺 ThekaWatch</h1>
              {isTracking && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-primary/20 rounded-full">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-accent-primary">Live</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {shopsCount} {shopsCount === 1 ? 'shop' : 'shops'} nearby
              {isTracking && <span className="hidden sm:inline"> • Location tracking active</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

