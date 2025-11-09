'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [reliability, setReliability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/metrics').then(res => res.json()).catch(() => null),
      fetch('/admin/reliability.json').then(res => res.json()).catch(() => null)
    ]).then(([metricsData, reliabilityData]) => {
      setMetrics(metricsData);
      setReliability(reliabilityData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading metrics...</div>
      </div>
    );
  }

  const reliabilityHistory = reliability?.history || [];
  const complianceData = reliability?.compliance ? [
    { name: 'HTTPS', value: reliability.compliance.https ? 100 : 0 },
    { name: 'RLS', value: reliability.compliance.rls ? 100 : 0 },
    { name: 'CORS', value: reliability.compliance.cors ? 100 : 0 },
    { name: 'MFA', value: reliability.compliance.mfa ? 100 : 0 },
    { name: 'Secrets', value: reliability.compliance.secrets ? 100 : 0 }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Metrics Dashboard</h1>
      
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Uptime</h2>
            <p className="text-2xl">{metrics.uptime ? `${(metrics.uptime / 3600).toFixed(2)}h` : 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Memory</h2>
            <p className="text-2xl">{metrics.memory ? `${(metrics.memory.heapUsed / 1024 / 1024).toFixed(0)}MB` : 'N/A'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Node Version</h2>
            <p className="text-2xl">{metrics.version || 'N/A'}</p>
          </div>
        </div>
      )}

      {reliability && (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Reliability Metrics</h2>
            {reliabilityHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reliabilityHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uptime" stroke="#8884d8" name="Uptime %" />
                  <Line type="monotone" dataKey="latency" stroke="#82ca9d" name="Latency (ms)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No historical data available</p>
            )}
          </div>

          {complianceData.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Compliance Score</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Last Updated</h2>
        <p className="text-gray-600">{metrics?.timestamp || reliability?.timestamp || 'Never'}</p>
      </div>
    </div>
  );
}
