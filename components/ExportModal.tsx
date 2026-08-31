'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, X, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

interface ExportData {
  roomName: string;
  roomCode: string;
  department: string;
  generatedAt: string;
  host: string;
  summary: {
    totalMembers: number;
    totalDeadlines: number;
    totalSubmissions: number;
  };
  matrix: Array<{
    memberId: string;
    name: string;
    role: string;
    department?: string;
    empId: string;
    totalAssigned: number;
    totalSubmitted: number;
    complianceRate: string;
    tasks: Array<{
      taskId: string;
      taskTitle: string;
      isAssigned: boolean;
      status: string;
      fileName: string | null;
      uploadedAt: string | null;
      fileSize: string | null;
    }>;
  }>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [data, setData] = useState<ExportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch(`/api/rooms/${roomCode}/export`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen, roomCode]);

  if (!isOpen) return null;

  const downloadCSV = () => {
    if (!data) return;

    const headers = ['Member Name', 'Role', 'Department', 'Employee ID', 'Assigned Tasks', 'Submitted', 'Compliance Rate'];
    const rows = data.matrix.map((m) => [
      `"${m.name}"`,
      m.role,
      `"${m.department || 'N/A'}"`,
      m.empId,
      m.totalAssigned,
      m.totalSubmitted,
      m.complianceRate,
    ]);

    const csvContent = [
      `"Co-work Consolidated Report - ${data.roomName} (#${data.roomCode})"`,
      `"Generated: ${new Date(data.generatedAt).toLocaleString()} | Host: ${data.host}"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.roomCode}_Submissions_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyJSON = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-xl bg-white border border-slate-200 p-6 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Submission Matrix Export
              </h2>
              <p className="text-xs text-slate-500">
                Summary for {data?.roomName || roomCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Loading matrix...
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-red-600 text-xs">
            Failed to load data.
          </div>
        ) : (
          <div className="flex-1 overflow-auto mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Total Members</div>
                <div className="font-bold text-slate-900 font-mono text-sm">{data.summary.totalMembers}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Deadlines</div>
                <div className="font-bold text-slate-900 font-mono text-sm">{data.summary.totalDeadlines}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-800 font-medium">Files Received</div>
                <div className="font-bold text-emerald-900 font-mono text-sm">{data.summary.totalSubmissions}</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-2.5 font-bold">Engineer</th>
                    <th className="p-2.5 font-bold">Department</th>
                    <th className="p-2.5 font-bold text-center">Submitted / Assigned</th>
                    <th className="p-2.5 font-bold text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.matrix.map((m) => (
                    <tr key={m.memberId} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{m.name}</td>
                      <td className="p-2.5 text-slate-600">{m.department || 'N/A'}</td>
                      <td className="p-2.5 text-center text-slate-800 font-bold">
                        {m.totalSubmitted} / {m.totalAssigned}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            parseInt(m.complianceRate) >= 100
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.complianceRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <button
            onClick={copyJSON}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={downloadCSV}
            disabled={!data}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
