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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-xl bg-[#111114] border border-[#27272a] p-5 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18181c] border border-[#27272a] flex items-center justify-center text-neutral-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Submission Matrix Export
              </h2>
              <p className="text-[11px] text-neutral-400">
                Summary for {data?.roomName || roomCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 text-xs">
            Loading matrix...
          </div>
        ) : !data ? (
          <div className="p-8 text-center text-red-400 text-xs">
            Failed to load data.
          </div>
        ) : (
          <div className="flex-1 overflow-auto mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-[#141418] border border-[#222226]">
                <div className="text-[10px] text-neutral-400">Members</div>
                <div className="font-semibold text-white font-mono text-xs">{data.summary.totalMembers}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141418] border border-[#222226]">
                <div className="text-[10px] text-neutral-400">Deadlines</div>
                <div className="font-semibold text-white font-mono text-xs">{data.summary.totalDeadlines}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141418] border border-[#222226]">
                <div className="text-[10px] text-neutral-400">Files Received</div>
                <div className="font-semibold text-emerald-400 font-mono text-xs">{data.summary.totalSubmissions}</div>
              </div>
            </div>

            <div className="rounded-lg border border-[#222226] bg-[#0c0c0e] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-[#18181c] text-neutral-400 border-b border-[#222226]">
                    <th className="p-2.5 font-semibold">Engineer</th>
                    <th className="p-2.5 font-semibold">Department</th>
                    <th className="p-2.5 font-semibold text-center">Submitted / Assigned</th>
                    <th className="p-2.5 font-semibold text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c22] text-neutral-300">
                  {data.matrix.map((m) => (
                    <tr key={m.memberId} className="hover:bg-[#141418]">
                      <td className="p-2.5 font-medium text-white">{m.name}</td>
                      <td className="p-2.5 text-neutral-400">{m.department || 'N/A'}</td>
                      <td className="p-2.5 text-center text-neutral-300">
                        {m.totalSubmitted} / {m.totalAssigned}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            parseInt(m.complianceRate) >= 100
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                              : 'bg-neutral-800 text-neutral-400'
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
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222226]">
          <button
            onClick={copyJSON}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={downloadCSV}
            disabled={!data}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
