'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, X, CheckCircle2, Clock, AlertCircle, Copy, Check } from 'lucide-react';

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

    // Build CSV lines
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel-glow border border-slate-700/80 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Consolidated Submission Matrix & Export
              </h2>
              <p className="text-xs text-slate-400">
                Summary report for {data?.roomName || roomCode} ({data?.department})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading / Content */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Generating summary compliance matrix...
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-rose-400 text-sm">
            Failed to load export data.
          </div>
        ) : (
          <div className="flex-1 overflow-auto mt-4 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Team Roster</div>
                <div className="text-lg font-bold text-white font-mono">{data.summary.totalMembers} Members</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] text-slate-400">Deadlines Assigned</div>
                <div className="text-lg font-bold text-blue-400 font-mono">{data.summary.totalDeadlines} Deliverables</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                <div className="text-[11px] text-emerald-400">Files Received</div>
                <div className="text-lg font-bold text-emerald-300 font-mono">{data.summary.totalSubmissions} Uploads</div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-semibold">Engineer Name</th>
                    <th className="p-3 font-semibold">Role & ID</th>
                    <th className="p-3 font-semibold">Department</th>
                    <th className="p-3 font-semibold text-center">Submitted / Assigned</th>
                    <th className="p-3 font-semibold text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.matrix.map((m) => (
                    <tr key={m.memberId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{m.name}</td>
                      <td className="p-3 text-slate-400">{m.role} ({m.empId})</td>
                      <td className="p-3 text-slate-400">{m.department || 'N/A'}</td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-blue-400">{m.totalSubmitted}</span>
                        <span className="text-slate-500"> / {m.totalAssigned}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            parseInt(m.complianceRate) >= 100
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : parseInt(m.complianceRate) > 0
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
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
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={copyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied JSON!' : 'Copy JSON'}
          </button>

          <button
            onClick={downloadCSV}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Master Excel / CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
