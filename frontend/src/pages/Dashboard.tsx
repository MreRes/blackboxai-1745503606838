import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

interface BudgetSummary {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
}

const Dashboard = () => {
  const [summary, setSummary] = useState<TransactionSummary>({
    income: 0,
    expense: 0,
    balance: 0
  });
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, budgetData] = await Promise.all([
          api.get<TransactionSummary>('/transactions/stats'),
          api.get<BudgetSummary[]>('/budgets')
        ]);

        setSummary(summaryData);
        setBudgets(budgetData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Income</h2>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {api.formatCurrency(summary.income)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Expenses</h2>
          <p className="mt-2 text-3xl font-semibold text-red-600">
            {api.formatCurrency(summary.expense)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Current Balance</h2>
          <p className="mt-2 text-3xl font-semibold text-primary-600">
            {api.formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h2>
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {budget.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {api.formatCurrency(budget.spent)} / {api.formatCurrency(budget.budget)}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        budget.percentage > 100
                          ? 'bg-red-500'
                          : budget.percentage > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
