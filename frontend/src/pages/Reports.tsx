import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

const Reports = () => {
  const [period, setPeriod] = useState('month'); // month, quarter, year
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date.toISOString().split('T')[0];
  });
  
  const [summary, setSummary] = useState<TransactionSummary>({
    income: 0,
    expense: 0,
    balance: 0
  });
  const [topExpenses, setTopExpenses] = useState<CategorySummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    try {
      const [summaryData, expensesData, monthlyData] = await Promise.all([
        api.get<TransactionSummary>(`/transactions/stats?startDate=${startDate}&endDate=${endDate}`),
        api.get<CategorySummary[]>(`/transactions/categories?type=expense&startDate=${startDate}&endDate=${endDate}`),
        api.get<MonthlyData[]>(`/transactions/monthly?startDate=${startDate}&endDate=${endDate}`)
      ]);

      setSummary(summaryData);
      setTopExpenses(expensesData);
      setMonthlyData(monthlyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const handlePeriodChange = (newPeriod: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (newPeriod) {
      case 'month':
        start.setDate(1);
        end.setMonth(today.getMonth() + 1);
        end.setDate(0);
        break;
      case 'quarter':
        start.setMonth(Math.floor(today.getMonth() / 3) * 3);
        start.setDate(1);
        end.setMonth(Math.floor(today.getMonth() / 3) * 3 + 3);
        end.setDate(0);
        break;
      case 'year':
        start.setMonth(0);
        start.setDate(1);
        end.setMonth(11);
        end.setDate(31);
        break;
    }

    setPeriod(newPeriod);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePeriodChange('month')}
              className={`btn ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Month
            </button>
            <button
              onClick={() => handlePeriodChange('quarter')}
              className={`btn ${period === 'quarter' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Quarter
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`btn ${period === 'year' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white p-4 rounded-lg shadow flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <h2 className="text-sm font-medium text-gray-500">Net Balance</h2>
            <p className="mt-2 text-3xl font-semibold text-primary-600">
            {api.formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Expense Categories</h2>
          <div className="space-y-4">
            {topExpenses.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {api.formatCurrency(category.total)} ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${category.percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h2>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">{data.month}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Income</p>
                    <p className="text-sm font-medium text-green-600">
                      {api.formatCurrency(data.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expenses</p>
                    <p className="text-sm font-medium text-red-600">
                      {api.formatCurrency(data.expense)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-sm font-medium text-primary-600">
                      {api.formatCurrency(data.balance)}
                    </p>
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

export default Reports;
