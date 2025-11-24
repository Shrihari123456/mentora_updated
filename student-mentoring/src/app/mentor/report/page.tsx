'use client';
import { useState, useMemo } from 'react';
import { useTable } from 'react-table';
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Type definitions
type Student = {
  _id: string;
  name: string;
  email: string;
  admissionYear: number;
  section: string;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  marks?: {
    subject: string;
    score: number;
  }[];
};

type QueryResponse = {
  success: boolean;
  data: Student[];
  visualization: {
    type: 'table' | 'bar' | 'pie';
    xField?: string;
    yField?: string;
  };
  pipeline?: any[];
  message?: string;
  error?: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const exampleQueries = [
  "Show average height by section",
  "Count students by blood group",
  "List students admitted in 2023",
  "Find students with height above 170 cm",
  "Show average weight by section",
  "Top 5 tallest students",
  "Students with O+ blood group",
  "Count of students per admission year",
  "Students born after January 1, 2005",
  "Show students with height between 160-180 cm"
];
export default function StudentQueryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/query/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data: QueryResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || data.error || 'Query failed');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  // React-table configuration
  const StudentTable = ({ data }: { data: any[] }) => {
    const columns = useMemo(() => {
      if (!data || data.length === 0) return [];
      
      // Get all unique keys from the data
      const allKeys = new Set<string>();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      return Array.from(allKeys).map(key => ({
        Header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        accessor: key,
        Cell: ({ value }: { value: any }) => {
          if (value === null || value === undefined) return 'N/A';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        }
      }));
    }, [data]);

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({ columns, data });

    return (
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            {headerGroups.map((headerGroup, i) => (
              <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, j) => (
                  <th
                    key={j}
                    {...column.getHeaderProps()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr key={i} {...row.getRowProps()} className="hover:bg-gray-50">
                  {row.cells.map((cell, j) => (
                    <td
                      key={j}
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const prepareChartData = (data: any[], xField?: string, yField?: string) => {
    if (!data || data.length === 0) return [];

    return data.map(item => {
      const result: any = {};
      
      // Handle _id field for grouped data
      if (item._id !== undefined) {
        result[xField || 'category'] = item._id;
      }
      
      // Add all other fields
      Object.keys(item).forEach(key => {
        if (key !== '_id') {
          result[key] = item[key];
        }
      });

      return result;
    });
  };

  const renderVisualization = () => {
    if (!results || !results.data || results.data.length === 0) return null;

    const { visualization } = results;
    const chartData = prepareChartData(results.data, visualization.xField, visualization.yField);

    switch (visualization.type) {
      case 'table':
        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Student Records</h3>
            <StudentTable data={results.data} />
          </div>
        );

      case 'bar':
        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Bar Chart Visualization</h3>
            <div className="h-96 bg-white p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={visualization.xField || 'category'}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={visualization.yField || 'count'}
                    fill="#4f46e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Pie Chart Visualization</h3>
            <div className="h-96 bg-white p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey={visualization.yField || 'count'}
                    nameKey={visualization.xField || 'category'}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  
 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Student Analytics Dashboard</h1>
          <p className="text-lg text-indigo-600">
            Transform natural language questions into actionable insights
          </p>
        </div>

        {/* Query Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                Ask about your student data
              </label>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Example: 'Show students with height above 170cm grouped by blood type'"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg text-white font-medium shadow-md ${
                    loading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Analyze Data'
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your query...</p>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-8">
            {/* Visualization Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
              {renderVisualization()}
            </div>

            {/* Debug Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Query Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Generated Pipeline</h4>
                  <pre className="text-xs overflow-auto max-h-40 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {JSON.stringify(results.pipeline, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Raw Data</h4>
                  <pre className="text-xs overflow-auto max-h-60 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-100">
            <div className="max-w-lg mx-auto">
              <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Ready to analyze student data</h3>
              <p className="mt-2 text-sm text-gray-500">
                Enter a natural language question about your student records or try one of the example queries above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
