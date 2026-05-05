'use client';

import { useDoctorQueue } from '@/hooks/useSupabaseIntegration';
import { useState } from 'react';

export default function DoctorQueue() {
  const { cases, loading, error, refetch } = useDoctorQueue();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">Error loading cases</p>
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

  if (!cases?.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 text-lg">
          No cases assigned to you yet.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          New cases will appear here when assigned.
        </p>
      </div>
    );
  }

  // Filter cases
  const filteredCases = filterStatus === 'all' 
    ? cases 
    : cases.filter(c => c.status === filterStatus);

  // Paginate
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

  // Get filter options from data
  const statuses = ['all', ...new Set(cases.map((c) => c.status).filter((status): status is string => Boolean(status)))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} 
            {filterStatus !== 'all' && ` (${filterStatus})`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {paginatedCases.map(caseItem => (
          <div
            key={caseItem.id}
            onClick={() => setSelectedCaseId(caseItem.id)}
            className={`p-4 border-l-4 rounded-lg cursor-pointer transition ${
              selectedCaseId === caseItem.id
                ? 'bg-blue-50 border-blue-600 border'
                : 'bg-white border-gray-200 border hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">
                  {caseItem.patient_name || 'Patient'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ID: {caseItem.id.substring(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  caseItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                  caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {caseItem.status}
                </span>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <p className="text-gray-500 text-xs">Priority</p>
                <p className="font-medium text-gray-900">
                  {caseItem.priority || 'Normal'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(caseItem.created_at ?? Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Selected Case Details */}
      {selectedCaseId && (
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-lg font-semibold text-gray-900">
            Case Details
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Selected Case ID: {selectedCaseId}
          </p>
          <button
            onClick={() => setSelectedCaseId(null)}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
