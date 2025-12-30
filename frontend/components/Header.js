export default function Header({ shopsCount, isTracking }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border">
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white">ThekaWatch</h1>
              {isTracking && (
                <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 bg-accent-primary/20 rounded-full">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-accent-primary">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {shopsCount} {shopsCount === 1 ? 'shop' : 'shops'} nearby
              <span className="hidden sm:inline">{isTracking && ' • Location tracking active'}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
              <span className="text-lg sm:text-2xl">🟢</span>
              <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">Low</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
              <span className="text-lg sm:text-2xl">🟡</span>
              <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">Med</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
              <span className="text-lg sm:text-2xl">🔴</span>
              <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:inline">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

