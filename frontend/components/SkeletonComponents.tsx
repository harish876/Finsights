export const SkeletonMetricCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-3/4 mt-2"></div>
  </div>
);

export const SkeletonInsightItem = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="flex-shrink-0 mt-1 h-6 w-6 bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="animate-pulse flex flex-col items-center justify-center h-full">
    <div className="rounded-full bg-gray-200 h-32 w-32"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mt-2"></div>
  </div>
);
