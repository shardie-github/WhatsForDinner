/**
 * React Hooks for Revenue System
 * Pre-built hooks for easy integration
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/lib/ux/toast';

export function useAffiliateDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/affiliate/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        setError(err.message);
        toast.error('Failed to load affiliate dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useRevenueDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/revenue/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        setError(err.message);
        toast.error('Failed to load revenue dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useUpsellOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upsells/opportunities')
      .then(res => res.json())
      .then(data => setOpportunities(data.opportunities || []))
      .catch(() => toast.error('Failed to load upsell opportunities'))
      .finally(() => setLoading(false));
  }, []);

  return { opportunities, loading };
}
