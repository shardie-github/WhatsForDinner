/**
 * Developer Dashboard: Connectivity Matrix
 * 
 * Renders Connectivity Matrix, last run, failing checks, quick links to PRs/logs.
 */

'use client';

import { useEffect, useState } from 'react';

interface CheckResult {
  status: 'pass' | 'fail' | 'degraded' | 'skip';
  latency?: number;
  evidence?: string[];
  error?: string;
  fixPr?: string;
  nextAction?: string;
}

interface ConnectivityCheck {
  category: string;
  subsystem: string;
  result: CheckResult;
}

interface ConnectivityMatrix {
  timestamp: string;
  version: string;
  environment: string;
  checks: ConnectivityCheck[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    degraded: number;
    skip: number;
  };
}

export default function WiringDashboard() {
  const [matrix, setMatrix] = useState<ConnectivityMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch connectivity matrix
    fetch('/wiring-status.json')
      .then(res => res.json())
      .then((data: ConnectivityMatrix) => {
        setMatrix(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading connectivity matrix...</div>;
  }

  if (error || !matrix) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Connectivity Matrix</h1>
        <p className="text-red-600">
          {error || 'No connectivity data available. Run `pnpm wiring:run` to generate.'}
        </p>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '?';
      case 'fail':
        return '?';
      case 'degraded':
        return '??';
      case 'skip':
        return '??';
      default:
        return '?';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'skip':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const failures = matrix.checks.filter(c => c.result.status === 'fail');
  const degraded = matrix.checks.filter(c => c.result.status === 'degraded');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">?? Connectivity Matrix</h1>
      
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold">{matrix.summary.pass}</div>
          <div className="text-sm text-gray-600">? Pass</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold">{matrix.summary.fail}</div>
          <div className="text-sm text-gray-600">? Fail</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold">{matrix.summary.degraded}</div>
          <div className="text-sm text-gray-600">?? Degraded</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-2xl font-bold">{matrix.summary.skip}</div>
          <div className="text-sm text-gray-600">?? Skip</div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Last run: {new Date(matrix.timestamp).toLocaleString()}
        <br />
        Version: {matrix.version} | Environment: {matrix.environment}
      </div>

      {failures.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
          <h2 className="font-bold text-red-800 mb-2">? Failures ({failures.length})</h2>
          <ul className="list-disc list-inside space-y-1">
            {failures.map((check, idx) => (
              <li key={idx} className="text-sm">
                <strong>{check.category} - {check.subsystem}</strong>: {check.result.error}
                {check.result.nextAction && (
                  <span className="text-gray-600"> ? {check.result.nextAction}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {degraded.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded p-4">
          <h2 className="font-bold text-yellow-800 mb-2">?? Degraded ({degraded.length})</h2>
          <ul className="list-disc list-inside space-y-1">
            {degraded.map((check, idx) => (
              <li key={idx} className="text-sm">
                <strong>{check.category} - {check.subsystem}</strong>
                {check.result.nextAction && (
                  <span className="text-gray-600"> ? {check.result.nextAction}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left border">Category</th>
              <th className="px-4 py-2 text-left border">Subsystem</th>
              <th className="px-4 py-2 text-left border">Status</th>
              <th className="px-4 py-2 text-left border">Latency</th>
              <th className="px-4 py-2 text-left border">Error</th>
              <th className="px-4 py-2 text-left border">Action</th>
            </tr>
          </thead>
          <tbody>
            {matrix.checks.map((check, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{check.category}</td>
                <td className="px-4 py-2 border">{check.subsystem}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${statusColor(check.result.status)}`}>
                    {statusIcon(check.result.status)} {check.result.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {check.result.latency ? `${check.result.latency}ms` : '-'}
                </td>
                <td className="px-4 py-2 border text-sm text-red-600">
                  {check.result.error || '-'}
                </td>
                <td className="px-4 py-2 border text-sm">
                  {check.result.fixPr ? (
                    <a href={check.result.fixPr} className="text-blue-600 hover:underline">
                      View PR
                    </a>
                  ) : check.result.nextAction ? (
                    <span className="text-gray-600">{check.result.nextAction}</span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="font-bold mb-2">Quick Actions</h2>
        <div className="flex gap-2">
          <a
            href="/reports/connectivity/wiring_report.md"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Full Report
          </a>
          <a
            href="/reports/connectivity/connectivity.json"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Download JSON
          </a>
        </div>
      </div>
    </div>
  );
}
