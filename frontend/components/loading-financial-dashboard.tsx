import type React from "react";
import {
  SkeletonMetricCard,
  SkeletonInsightItem,
  SkeletonChart,
} from "./SkeletonComponents";

const LoadingDashboardComponent: React.FC = () => {
  return (
    <div className="container mx-auto p-6 bg-inherit min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <SkeletonInsightItem />
            <SkeletonInsightItem />
            <SkeletonInsightItem />
            <SkeletonInsightItem />
            <SkeletonInsightItem />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8" style={{ height: "500px" }}>
            <SkeletonChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Credit Breakdown
          </h2>
          <div style={{ height: "300px" }}>
            <SkeletonChart />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Debit Breakdown
          </h2>
          <div style={{ height: "300px" }}>
            <SkeletonChart />
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Recurring Expenses
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonRecurringExpenseCard />
          <SkeletonRecurringExpenseCard />
          <SkeletonRecurringExpenseCard />
        </div>
      </div>
    </div>
  );
};

const SkeletonRecurringExpenseCard: React.FC = () => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 animate-pulse">
    <div className="bg-gray-200 p-2 rounded-full h-10 w-10"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default LoadingDashboardComponent;
