import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { AlertCircle, RefreshCw, ExternalLink, Trash2, Activity } from 'lucide-react';

interface ServerError {
  id: string;
  url_path: string;
  error_type: string;
  status_code: number | null;
  error_message: string | null;
  stack_trace: string | null;
  user_agent: string | null;
  ip_address: string | null;
  referrer: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; latency_ms?: number; error?: string };
    storage: { status: string; error?: string };
  };
}

export default function ErrorLogs() {
  const [selectedError, setSelectedError] = useState<ServerError | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Fetch error logs
  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['server-errors', filter],
    queryFn: async () => {
      let query = supabase
        .from('server_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('error_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServerError[];
    },
  });

  // Fetch health status
  const { data: healthStatus, refetch: refetchHealth } = useQuery({
    queryKey: ['health-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('health-check');
      if (error) throw error;
      return data as HealthStatus;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (type: string) => {
    switch (type) {
      case '5xx':
        return 'bg-red-100 text-red-800';
      case 'react_error':
        return 'bg-orange-100 text-orange-800';
      case 'edge_function':
        return 'bg-purple-100 text-purple-800';
      case 'middleware':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-500">Monitor and debug server errors</p>
        </div>
        <button
          onClick={() => {
            refetch();
            refetchHealth();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Health Status Card */}
      {healthStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5" />
            <h2 className="text-lg font-semibold">System Health</h2>
            <span className={`font-medium ${getHealthColor(healthStatus.status)}`}>
              {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Database</div>
              <div className="flex items-center gap-2">
                <span className={healthStatus.checks.database.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                  {healthStatus.checks.database.status === 'ok' ? '✓' : '✗'}
                </span>
                <span className="font-medium">
                  {healthStatus.checks.database.status === 'ok' ? 'Connected' : 'Error'}
                </span>
                {healthStatus.checks.database.latency_ms && (
                  <span className="text-gray-400 text-sm">
                    ({healthStatus.checks.database.latency_ms}ms)
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Storage</div>
              <div className="flex items-center gap-2">
                <span className={healthStatus.checks.storage.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                  {healthStatus.checks.storage.status === 'ok' ? '✓' : '✗'}
                </span>
                <span className="font-medium">
                  {healthStatus.checks.storage.status === 'ok' ? 'Connected' : 'Error'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', '5xx', 'react_error', 'edge_function', 'middleware'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Error List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading errors...</div>
        ) : errors?.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No errors logged yet</p>
            <p className="text-sm text-gray-400">Errors will appear here when they occur</p>
          </div>
        ) : (
          <div className="divide-y">
            {errors?.map((error) => (
              <div
                key={error.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(error.error_type)}`}>
                        {error.error_type}
                      </span>
                      {error.status_code && (
                        <span className="text-sm text-gray-500">
                          Status: {error.status_code}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{error.url_path}</p>
                    {error.error_message && (
                      <p className="text-sm text-gray-600 truncate max-w-xl">
                        {error.error_message}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(new Date(error.created_at), 'MMM d, HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Error Details</h3>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">URL Path</dt>
                  <dd className="mt-1 font-mono text-sm">{selectedError.url_path}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Error Type</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedError.error_type)}`}>
                      {selectedError.error_type}
                    </span>
                  </dd>
                </div>
                {selectedError.status_code && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status Code</dt>
                    <dd className="mt-1">{selectedError.status_code}</dd>
                  </div>
                )}
                {selectedError.error_message && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Error Message</dt>
                    <dd className="mt-1 text-sm text-red-600">{selectedError.error_message}</dd>
                  </div>
                )}
                {selectedError.stack_trace && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Stack Trace</dt>
                    <dd className="mt-1 p-3 bg-gray-900 text-gray-100 rounded font-mono text-xs overflow-auto max-h-48">
                      <pre>{selectedError.stack_trace}</pre>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                  <dd className="mt-1 text-sm">
                    {format(new Date(selectedError.created_at), 'PPpp')}
                  </dd>
                </div>
                {selectedError.user_agent && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                    <dd className="mt-1 text-sm text-gray-600 truncate">{selectedError.user_agent}</dd>
                  </div>
                )}
                {selectedError.ip_address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                    <dd className="mt-1 font-mono text-sm">{selectedError.ip_address}</dd>
                  </div>
                )}
                {selectedError.referrer && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Referrer</dt>
                    <dd className="mt-1 text-sm">{selectedError.referrer}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}