export default function Header({ shopsCount, isTracking }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] bg-dark-surface/95 backdrop-blur-sm border-b border-dark-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">ThekaWatch</h1>
              {isTracking && (
                <div className="flex items-center gap-1 px-2 py-1 bg-accent-primary/20 rounded-full">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
                  <span className="text-xs text-accent-primary">Live</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {shopsCount} {shopsCount === 1 ? 'shop' : 'shops'} nearby
              {isTracking && ' • Location tracking active'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-2xl">🟢</span>
              <span className="text-gray-400">Low</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-2xl">🟡</span>
              <span className="text-gray-400">Med</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-2xl">🔴</span>
              <span className="text-gray-400">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

