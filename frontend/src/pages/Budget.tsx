import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: {
    start: string;
    end: string;
  };
  spent?: number;
  remaining?: number;
}

const Budget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchBudgets = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      const data = await api.get<Budget[]>(
        `/budgets?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      const payload = {
        category: formData.get('category'),
        amount: Number(formData.get('amount')),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }

      fetchBudgets();
      setShowForm(false);
      setEditingBudget(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await api.delete(`/budgets/${id}`);

      fetchBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Budget Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Add Budget
          </button>
        </div>

        {/* Month Selector */}
        <div className="bg-white p-4 rounded-lg shadow">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingBudget ? 'Edit Budget' : 'New Budget'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    name="category"
                    className="input mt-1"
                    required
                    defaultValue={editingBudget?.category}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    className="input mt-1"
                    required
                    defaultValue={editingBudget?.amount}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBudget(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{budget.category}</h3>
                  <p className="text-sm text-gray-500">
                  {api.formatCurrency(budget.amount)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingBudget(budget);
                      setShowForm(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Spent</span>
                  <span className="font-medium">
                    {api.formatCurrency(budget.spent || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className={`font-medium ${
                    (budget.remaining || 0) < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {api.formatCurrency(budget.remaining || 0)}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        width: `${Math.min(
                          ((budget.spent || 0) / budget.amount) * 100,
                          100
                        )}%`
                      }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        (budget.spent || 0) > budget.amount
                          ? 'bg-red-500'
                          : (budget.spent || 0) > budget.amount * 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Budget;
