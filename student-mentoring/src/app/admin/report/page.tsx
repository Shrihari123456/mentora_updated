'use client';
import { useState, useMemo } from 'react';
import { useTable } from 'react-table';
import {
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  Bar,
  Pie,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ZAxis
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
  marks?: number;
  dob?: string;
};

type VisualizationType = 'table' | 'bar' | 'pie' | 'line' | 'scatter';

type QueryResponse = {
  success: boolean;
  data: Student[];
  visualization: {
    type: VisualizationType;
    xField?: string;
    yField?: string;
    sizeField?: string;
    colorField?: string;
  };
  pipeline?: any[];
  explanation?: string;
  chartTitle?: string;
  chartOptions?: any;
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

const visualizationOptions: { value: VisualizationType; label: string; icon: string }[] = [
  { value: 'table', label: 'Table', icon: '📊' },
  { value: 'bar', label: 'Bar Chart', icon: '📈' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧' },
  { value: 'line', label: 'Line Chart', icon: '📉' },
  { value: 'scatter', label: 'Scatter Plot', icon: '✖️' }
];

export default function StudentQueryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('table');
  const [advancedOptions, setAdvancedOptions] = useState({
    showPipeline: false,
    showRawData: false,
    autoDetectVisualization: true
  });

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
      if (data.visualization?.type && advancedOptions.autoDetectVisualization) {
        setSelectedVisualization(data.visualization.type);
      }
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

    const visualizationType = selectedVisualization;
    const chartData = prepareChartData(
      results.data,
      results.visualization?.xField,
      results.visualization?.yField
    );

    const renderChartTitle = () => (
      <div className="mb-4">
        <h3 className="text-xl font-semibold">
          {results.chartTitle || 'Data Visualization'}
        </h3>
        {results.explanation && (
          <p className="text-sm text-gray-600 mt-1">{results.explanation}</p>
        )}
      </div>
    );

    switch (visualizationType) {
      case 'table':
        return (
          <div className="mt-4">
            {renderChartTitle()}
            <StudentTable data={results.data} />
          </div>
        );

      case 'bar':
        return (
          <div className="mt-4">
            {renderChartTitle()}
            <div className="h-96 bg-white p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={results.visualization?.xField || 'category'}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey={results.visualization?.yField || 'count'}
                    fill="#4f46e5"
                    name={results.visualization?.yField || 'Value'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="mt-4">
            {renderChartTitle()}
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
                    dataKey={results.visualization?.yField || 'count'}
                    nameKey={results.visualization?.xField || 'category'}
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

      case 'line':
        return (
          <div className="mt-4">
            {renderChartTitle()}
            <div className="h-96 bg-white p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={results.visualization?.xField || 'category'}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={results.visualization?.yField || 'count'}
                    stroke="#4f46e5"
                    activeDot={{ r: 8 }}
                    name={results.visualization?.yField || 'Value'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'scatter':
        return (
          <div className="mt-4">
            {renderChartTitle()}
            <div className="h-96 bg-white p-4 rounded-lg shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={results.visualization?.xField || 'x'}
                    name={results.visualization?.xField || 'X'}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    dataKey={results.visualization?.yField || 'y'}
                    name={results.visualization?.yField || 'Y'}
                  />
                  <ZAxis
                    dataKey={results.visualization?.sizeField || 'size'}
                    range={[60, 400]}
                    name={results.visualization?.sizeField || 'Size'}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="Data Points"
                    data={chartData}
                    fill="#4f46e5"
                    shape="circle"
                  />
                </ScatterChart>
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

            {/* Advanced Options */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Advanced Options</h3>
                <button
                  type="button"
                  onClick={() => setAdvancedOptions(prev => ({
                    ...prev,
                    showPipeline: !prev.showPipeline,
                    showRawData: !prev.showRawData
                  }))}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {advancedOptions.showPipeline ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={advancedOptions.autoDetectVisualization}
                    onChange={(e) => setAdvancedOptions(prev => ({
                      ...prev,
                      autoDetectVisualization: e.target.checked
                    }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-detect best visualization</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Visualization Selector */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-indigo-100">
            <div className="flex flex-wrap gap-2">
              {visualizationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedVisualization(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors ${
                    selectedVisualization === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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

            {/* Debug Info Card - Conditionally rendered */}
            {(advancedOptions.showPipeline || advancedOptions.showRawData) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Query Details</h3>
                <div className="space-y-4">
                  {advancedOptions.showPipeline && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Generated Pipeline</h4>
                      <pre className="text-xs overflow-auto max-h-40 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {JSON.stringify(results.pipeline, null, 2)}
                      </pre>
                    </div>
                  )}
                  {advancedOptions.showRawData && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Raw Data</h4>
                      <pre className="text-xs overflow-auto max-h-60 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {JSON.stringify(results.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
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