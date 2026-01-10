// src/components/medical-zone/ReportsSection.jsx
import React from 'react';
import { Download, Eye, Upload, FileHeart } from 'lucide-react';

const ReportsSection = ({ data, onAdd, onEdit, onDelete }) => {
  const reports = data.reports || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Medical Reports</h3>
        <button
          onClick={() => onAdd('report')}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Report
        </button>
      </div>

      {/* Empty State */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No reports uploaded</h4>
          <p className="text-gray-600">Upload medical reports for this patient</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <div key={report.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Status & Icon */}
              <div className="flex justify-between items-start mb-4">
                <FileHeart className="h-8 w-8 text-orange-500" />
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    (report.status || 'completed') === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : (report.status || 'completed') === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {(report.status || 'completed').charAt(0).toUpperCase() + (report.status || 'completed').slice(1)}
                </span>
              </div>

              {/* Report Info */}
              <h4 className="font-bold text-lg text-gray-900 mb-2">{report.name || 'Medical Report'}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{report.type || 'Lab report'}</p>
                <p>{report.date ? new Date(report.date).toLocaleDateString() : 'No date'}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onEdit('report', report)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button
                  onClick={() => onDelete && report.id && onDelete('report', report.id)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
