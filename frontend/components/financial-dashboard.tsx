import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  RepeatIcon,
  Repeat,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const FinancialDashboard = ({
  data,
}: {
  loading: boolean;
  data: Array<Record>;
}) => {
  const creditChartData = data
    ? {
        labels: data.credits.map((item) => item.category),
        datasets: [
          {
            data: data.credits.map((item) => item.total_amount),
            backgroundColor: ["#10B981", "#60A5FA"],
          },
        ],
      }
    : null;

  const debitChartData = data
    ? {
        labels: data.debits.map((item) => item.category),
        datasets: [
          {
            data: data.debits.map((item) => item.total_amount),
            backgroundColor: [
              "#EF4444",
              "#F59E0B",
              "#8B5CF6",
              "#EC4899",
              "#3B82F6",
              "#06B6D4",
              "#10B981",
              "#6366F1",
            ],
          },
        ],
      }
    : null;

  let topRecurringExpenses = data.debits
    .filter((debit) => debit.transaction_count > 1) // Filter recurring expenses (more than 1 transaction)
    .sort((a, b) => b.transaction_count - a.transaction_count) // Sort by transaction_count in descending order
    .slice(0, 3); // Pick top 3

  console.log(topRecurringExpenses);

  const comparisonChartData = data
    ? {
        labels: ["Credits", "Debits"],
        datasets: [
          {
            label: "Amount ($)",
            data: [
              data.trends.credit_debit_ratio.total_credits,
              data.trends.credit_debit_ratio.total_debits,
            ],
            backgroundColor: ["#10B981", "#EF4444"],
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-6 bg-inherit min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <>
          <MetricCard
            title="Total Credits"
            value={`$${data.trends.credit_debit_ratio.total_credits.toFixed(
              2
            )}`}
            icon={<ArrowUpRight className="text-green-500" />}
          />
          <MetricCard
            title="Total Debits"
            value={`$${data.trends.credit_debit_ratio.total_debits.toFixed(2)}`}
            icon={<ArrowDownRight className="text-red-500" />}
          />
          <MetricCard
            title="Credit-Debit Ratio"
            value={data.trends.credit_debit_ratio.ratio.toFixed(2)}
            icon={<TrendingUp className="text-blue-500" />}
          />
          <MetricCard
            title="Largest Expense"
            value={
              data.debits.reduce((max, debit) =>
                max.total_amount > debit.total_amount ? max : debit
              ).category
            }
            icon={<CreditCard className="text-purple-500" />}
          />
        </>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Financial Insights
          </h2>
          <div className="space-y-4">
            <>
              <InsightItem
                title="Income Pattern"
                description={data.trends.income_pattern}
                icon={<DollarSign className="text-green-500" />}
              />
              <InsightItem
                title="Spending Pattern"
                description={data.trends.spending_pattern}
                icon={<CreditCard className="text-blue-500" />}
              />
              <InsightItem
                title="Notable Observation"
                description={data.trends.notable_observation}
                icon={<TrendingUp className="text-purple-500" />}
              />
              <InsightItem
                title="Cash Flow Alert"
                description={data.trends.cash_flow_alert}
                icon={<AlertTriangle className="text-yellow-500" />}
              />
              <InsightItem
                title="Recurring Expenses"
                description={data.trends.recurring_expenses}
                icon={<RepeatIcon className="text-red-500" />}
              />
            </>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8" style={{ height: "500px" }}>
            <Bar
              data={comparisonChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: "Credits vs Debits",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Amount ($)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Credit Breakdown
          </h2>
          <div style={{ height: "300px" }}>
            <Pie
              data={creditChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: "Credit Sources",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Debit Breakdown
          </h2>
          <div style={{ height: "300px" }}>
            <Pie
              data={debitChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: "Expense Categories",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <RecurringExpenses expenses={topRecurringExpenses} />
    </div>
  );
};

export const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export const InsightItem = ({ title, description, icon }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div>
      <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

interface RecurringExpense {
  category: string;
  description: string;
  total_amount: number;
  transaction_count: number;
  notes: string;
}

interface RecurringExpensesProps {
  expenses: RecurringExpense[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "subscriptions":
      return <Repeat className="text-blue-500" />;
    case "transfer":
      return <CreditCard className="text-green-500" />;
    case "insurance":
      return <Shield className="text-purple-500" />;
    default:
      return <CreditCard className="text-gray-500" />;
  }
};

const getFrequency = (transaction_count: number) => {
  if (transaction_count >= 4) return "Monthly";
  if (transaction_count >= 2) return "Quarterly";
  return "Occasional";
};

export function RecurringExpenses({ expenses }: RecurringExpensesProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RepeatIcon className="h-6 w-6" />
          Recurring Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.description}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(expense.category)}
                    <span>{expense.category}</span>
                  </div>
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense?.notes}</TableCell>
                <TableCell className="text-right font-medium">
                  ${expense.total_amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default FinancialDashboard;
