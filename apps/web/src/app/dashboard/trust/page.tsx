'use client';

import { useEffect, useState } from 'react';
// Import types from guardian package
type TrustReport = {
  user_id: string;
  period_start: string;
  period_end: string;
  total_events: number;
  events_by_class: Record<string, number>;
  events_by_risk: Record<string, number>;
  policy_changes: number;
  anomalies_detected: number;
  guardian_confidence_score: number;
  hash_integrity_verified: boolean;
  violations_prevented: number;
  average_detection_latency_ms: number;
};

type GuardianRecommendation = {
  id: string;
  type: 'tighter' | 'looser' | 'policy_update';
  data_class: string;
  reason: string;
  impact: string;
  suggested_action: string;
  confidence: number;
};

interface TrustDashboardProps {
  userId: string;
}

export default function TrustDashboard({ userId }: TrustDashboardProps) {
  const [report, setReport] = useState<TrustReport | null>(null);
  const [recommendations, setRecommendations] = useState<GuardianRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [reportRes, recRes] = await Promise.all([
        fetch('/api/guardian/trust-report'),
        fetch('/api/guardian/recommendations'),
      ]);

      if (reportRes.ok) {
        const data = await reportRes.json();
        setReport(data);
      }

      if (recRes.ok) {
        const data = await recRes.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrivateMode = async () => {
    try {
      const res = await fetch('/api/guardian/private-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !privateMode }),
      });

      if (res.ok) {
        setPrivateMode(!privateMode);
      }
    } catch (error) {
      console.error('Failed to toggle private mode:', error);
    }
  };

  const activateLockdown = async () => {
    if (!confirm('Activate emergency data lockdown? This will freeze all telemetry.')) {
      return;
    }

    try {
      await fetch('/api/guardian/lockdown', { method: 'POST' });
      alert('Lockdown activated');
    } catch (error) {
      console.error('Failed to activate lockdown:', error);
    }
  };

  const exportFabric = async () => {
    try {
      const res = await fetch('/api/guardian/fabric/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trust_fabric_${userId}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export fabric:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading trust dashboard...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load trust report</div>
      </div>
    );
  }

  const confidenceColor =
    report.guardian_confidence_score >= 80
      ? 'text-green-600'
      : report.guardian_confidence_score >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Guardian</h1>
          <p className="text-gray-600">
            Your personal privacy guardian monitoring data access and building trust through transparency.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Events</div>
            <div className="text-3xl font-bold">{report.total_events}</div>
            <div className="text-xs text-gray-500 mt-1">This week</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
            <div className={`text-3xl font-bold ${confidenceColor}`}>
              {report.guardian_confidence_score.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Guardian confidence</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Violations Prevented</div>
            <div className="text-3xl font-bold text-red-600">{report.violations_prevented}</div>
            <div className="text-xs text-gray-500 mt-1">Blocked access attempts</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Hash Integrity</div>
            <div className="text-3xl font-bold">
              {report.hash_integrity_verified ? '✅' : '❌'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Ledger verified</div>
          </div>
        </div>

        {/* Risk Meter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(report.events_by_risk).map(([risk, count]) => (
              <div key={risk} className="text-center">
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className={`text-sm capitalize ${
                  risk === 'critical' || risk === 'high'
                    ? 'text-red-600'
                    : risk === 'medium'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {risk}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={togglePrivateMode}
              className={`px-4 py-2 rounded-lg ${
                privateMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {privateMode ? '🔒 Private Mode ON' : '🔓 Private Mode OFF'}
            </button>
            <button
              onClick={activateLockdown}
              className="px-4 py-2 rounded-lg bg-red-600 text-white"
            >
              🚨 Emergency Lockdown
            </button>
            <button
              onClick={exportFabric}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              📥 Export Trust Fabric
            </button>
            <a
              href="/api/guardian/weekly-report"
              download
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
            >
              📄 Weekly Report
            </a>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Guardian Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold">{rec.reason}</div>
                  <div className="text-sm text-gray-600 mt-1">{rec.impact}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {(rec.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events by Class */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Data Access by Class</h2>
          <div className="space-y-2">
            {Object.entries(report.events_by_class).map(([cls, count]) => (
              <div key={cls} className="flex justify-between items-center">
                <span className="capitalize">{cls}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
