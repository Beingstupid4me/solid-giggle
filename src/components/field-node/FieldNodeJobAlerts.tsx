'use client';

import { useDispatchQueue, useAcceptCase } from '@/hooks/useSupabaseIntegration';
import { useState, useEffect } from 'react';

export default function FieldNodeJobAlerts() {
  const { cases, loading, error, refetch } = useDispatchQueue();
  const { acceptCase, loading: acceptingCase, error: acceptError } = useAcceptCase();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMessages, setSuccessMessages] = useState<Record<string, boolean>>({});
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">Error loading job alerts</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter out completed cases
  const activeCases = cases?.filter(c => c.status !== 'completed') || [];

  if (!activeCases.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-gray-600 text-lg">No new job alerts</p>
        <p className="text-gray-500 text-sm mt-2">
          You're all caught up! Check back soon for new assignments.
        </p>
      </div>
    );
  }

  const handleAccept = async (caseId: string) => {
    setActionInProgress(caseId);
    try {
      const result = await acceptCase(caseId);
      if (result.success) {
        setSuccessMessages(prev => ({ ...prev, [caseId]: true }));
        setTimeout(() => {
          setSuccessMessages(prev => {
            const updated = { ...prev };
            delete updated[caseId];
            return updated;
          });
          refetch();
        }, 2000);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = (caseId: string) => {
    // TODO: Implement reject case functionality
    alert(`Case ${caseId} rejected`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Alerts</h1>
          <p className="text-gray-600">
            {activeCases.length} active case{activeCases.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Alert Badge */}
      {activeCases.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">
            🔔 You have {activeCases.length} new job{activeCases.length !== 1 ? 's' : ''} assigned!
          </p>
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-3">
        {activeCases.map(caseItem => (
          <div
            key={caseItem.id}
            className={`p-4 rounded-lg border-l-4 transition ${
              successMessages[caseItem.id]
                ? 'bg-green-50 border-green-500 border'
                : 'bg-white border-blue-500 border hover:shadow-md'
            }`}
          >
            {successMessages[caseItem.id] ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-green-700">Case Accepted!</p>
                  <p className="text-sm text-green-600">{caseItem.patient_name}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {caseItem.patient_name || 'Patient'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Case #{caseItem.id.substring(0, 8)}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                    NEW
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Location</p>
                    <p className="font-medium text-gray-900">
                      {caseItem.location || 'TBD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium text-gray-900">
                      {caseItem.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Priority</p>
                    <p className={`font-medium ${
                      caseItem.priority === 'high' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {caseItem.priority || 'Normal'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Assigned</p>
                    <p className="font-medium text-gray-900">
                      {new Date(caseItem.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(caseItem.id)}
                    disabled={actionInProgress === caseItem.id || acceptingCase}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      actionInProgress === caseItem.id
                        ? 'bg-blue-300 text-blue-50 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {actionInProgress === caseItem.id ? 'Accepting...' : '✓ Accept'}
                  </button>
                  <button
                    onClick={() => handleReject(caseItem.id)}
                    disabled={actionInProgress === caseItem.id}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      actionInProgress === caseItem.id
                        ? 'bg-gray-300 text-gray-50 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>

                {acceptError && (
                  <p className="text-red-600 text-sm mt-2">{acceptError}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="text-center text-gray-600 text-sm">
        <p>Auto-refreshing every 5 seconds</p>
      </div>
    </div>
  );
}
