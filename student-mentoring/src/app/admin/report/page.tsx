'use client';
import { useState, useMemo } from 'react';
import { useTable } from 'react-table';
import {
  BarChart, PieChart, LineChart, ScatterChart,
  Bar, Pie, Line, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ZAxis
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type VisualizationType = 'table' | 'bar' | 'pie' | 'line' | 'scatter';

type QueryResponse = {
  success: boolean;
  data: any[];
  collection?: string;
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
  message?: string;
  error?: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// ─── Example queries ─────────────────────────────────────────────────────────

const exampleQueries = [
  // Student queries
  "Show average height by section",
  "Count students by blood group",
  "List students admitted in 2023",
  "Top 5 tallest students",
  "Students with O+ blood group",
  // Mentor queries
  "List all mentors",
  "How many students does each mentor have?",
  "Show mentors in CSE department",
  // Cross-collection queries
  "Who is the mentor of student Ashika?",
  "Find mentor for Prajwal m",
  "Show students under mentor with empId EMP001",
  "Which mentor handles the most students?",
];

// Group queries by category for display
const queryCategories = [
  {
    label: '👨‍🎓 Student',
    queries: [
      "Show average height by section",
      "Count students by blood group",
      "List students admitted in 2023",
      "Top 5 tallest students",
      "Students with O+ blood group",
    ]
  },
  {
    label: '👨‍🏫 Mentor',
    queries: [
      "List all mentors",
      "How many students does each mentor have?",
      "Show mentors in CSE department",
    ]
  },
  {
    label: '🔗 Cross-collection',
    queries: [
      "Who is the mentor of student Ashika?",
      "Find mentor for SR number CA24771",
      "Show students under mentor EMP001",
      "Which mentor handles the most students?",
    ]
  }
];

const visualizationOptions: { value: VisualizationType; label: string; icon: string }[] = [
  { value: 'table',   label: 'Table',        icon: '📊' },
  { value: 'bar',     label: 'Bar Chart',    icon: '📈' },
  { value: 'pie',     label: 'Pie Chart',    icon: '🥧' },
  { value: 'line',    label: 'Line Chart',   icon: '📉' },
  { value: 'scatter', label: 'Scatter Plot', icon: '✖️' }
];

// ─── Table Component ──────────────────────────────────────────────────────────

const DataTable = ({ data }: { data: any[] }) => {
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    const allKeys = new Set<string>();
    data.forEach(item => {
      const flatten = (obj: any, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const val = obj[key];
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
            flatten(val, fullKey);
          } else {
            allKeys.add(fullKey);
          }
        });
      };
      flatten(item);
    });

    // Remove internal mongo fields
    const filtered = Array.from(allKeys).filter(k => k !== '__v');

    return filtered.map(key => ({
      Header: key
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1'))
        .join(' → '),
      accessor: key,
      Cell: ({ value }: { value: any }) => {
        if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
        if (Array.isArray(value)) return <span className="text-gray-500 text-xs">[{value.length} items]</span>;
        if (typeof value === 'object') return <span className="text-gray-500 text-xs">{JSON.stringify(value).slice(0, 40)}</span>;
        return String(value);
      }
    }));
  }, [data]);

  // Flatten nested objects for react-table
  const flatData = useMemo(() => data.map(item => {
    const result: any = {};
    const flatten = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const val = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
          flatten(val, fullKey);
        } else {
          result[fullKey] = val;
        }
      });
    };
    flatten(item);
    return result;
  }), [data]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: flatData,
  });

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {headerGroups.map((hg, i) => (
            <tr key={i} {...hg.getHeaderGroupProps()}>
              {hg.headers.map((col, j) => (
                <th key={j} {...col.getHeaderProps()}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {col.render('Header')}
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
                  <td key={j} {...cell.getCellProps()}
                    className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        {rows.length} record{rows.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminQueryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('table');
  const [showDetails, setShowDetails] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) { setError('Please enter a query'); return; }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:8000/api/query/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data: QueryResponse = await response.json();

      if (!response.ok) throw new Error(data.error || data.message || `HTTP error ${response.status}`);
      if (!data.success) throw new Error(data.message || data.error || 'Query failed');

      setResults(data);
      if (data.visualization?.type && autoDetect) {
        setSelectedVisualization(data.visualization.type);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data: any[], xField?: string, yField?: string) => {
    if (!data || data.length === 0) return [];
    return data.map(item => {
      const result: any = {};
      if (item._id !== undefined) result[xField || 'category'] = item._id;
      Object.keys(item).forEach(key => {
        if (key !== '_id') result[key] = item[key];
      });
      return result;
    });
  };

  const collectionBadge = (collection?: string) => {
    if (!collection) return null;
    const map: Record<string, { label: string; color: string }> = {
      students:              { label: '👨‍🎓 Students',                  color: 'bg-blue-100 text-blue-700' },
      mentors:               { label: '👨‍🏫 Mentors',                   color: 'bg-purple-100 text-purple-700' },
      students_with_mentor:  { label: '🔗 Students + Mentor',          color: 'bg-green-100 text-green-700' },
      mentors_with_students: { label: '🔗 Mentors + Students',         color: 'bg-orange-100 text-orange-700' },
    };
    const info = map[collection] || { label: collection, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  const renderVisualization = () => {
    if (!results?.data?.length) return null;

    const chartData = prepareChartData(
      results.data,
      results.visualization?.xField,
      results.visualization?.yField
    );

    const ChartTitle = () => (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold">{results.chartTitle || 'Results'}</h3>
          {collectionBadge(results.collection)}
        </div>
        {results.explanation && (
          <p className="text-sm text-gray-500">{results.explanation}</p>
        )}
      </div>
    );

    switch (selectedVisualization) {
      case 'table':
        return <div className="mt-2"><ChartTitle /><DataTable data={results.data} /></div>;

      case 'bar':
        return (
          <div className="mt-2">
            <ChartTitle />
            <div className="h-96 bg-white p-4 rounded-lg shadow-sm border">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={results.visualization?.xField || 'category'} angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={results.visualization?.yField || 'count'} fill="#4f46e5" name={results.visualization?.yField || 'Value'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="mt-2">
            <ChartTitle />
            <div className="h-96 bg-white p-4 rounded-lg shadow-sm border">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={120}
                    dataKey={results.visualization?.yField || 'count'}
                    nameKey={results.visualization?.xField || 'category'}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
          <div className="mt-2">
            <ChartTitle />
            <div className="h-96 bg-white p-4 rounded-lg shadow-sm border">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={results.visualization?.xField || 'category'} angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={results.visualization?.yField || 'count'} stroke="#4f46e5" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'scatter':
        return (
          <div className="mt-2">
            <ChartTitle />
            <div className="h-96 bg-white p-4 rounded-lg shadow-sm border">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={results.visualization?.xField || 'x'} angle={-45} textAnchor="end" height={70} />
                  <YAxis dataKey={results.visualization?.yField || 'y'} />
                  <ZAxis dataKey={results.visualization?.sizeField || 'size'} range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Data Points" data={chartData} fill="#4f46e5" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-lg text-indigo-600">
            Query students, mentors, and cross-collection data using natural language
          </p>
        </div>

        {/* Query Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ask anything about students or mentors
              </label>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='e.g. "Who is the mentor of student Ashika?" or "Count students by blood group"'
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg text-white font-medium shadow-md whitespace-nowrap ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transition-all'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : 'Analyze'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Categorized example queries */}
            <div className="space-y-3">
              {queryCategories.map(cat => (
                <div key={cat.label}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{cat.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.queries.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setQuery(q); }}
                        className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={e => setAutoDetect(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                Auto-detect best visualization
              </label>
              <button
                type="button"
                onClick={() => setShowDetails(v => !v)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                {showDetails ? 'Hide' : 'Show'} pipeline details
              </button>
            </div>
          </form>
        </div>

        {/* Visualization selector */}
        {results && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-indigo-100">
            <div className="flex flex-wrap gap-2">
              {visualizationOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedVisualization(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    selectedVisualization === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Analyzing your query...</p>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
              {results.data.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-lg">No results found</p>
                  <p className="text-sm mt-1">{results.explanation}</p>
                </div>
              ) : renderVisualization()}
            </div>

            {showDetails && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Pipeline Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Collection: {results.collection}</p>
                    <pre className="text-xs overflow-auto max-h-48 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {JSON.stringify(results.pipeline, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-indigo-100">
            <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-800">Ready to analyze</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
              Ask anything — student data, mentor info, or cross-collection queries like "Who is the mentor of student X?"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}