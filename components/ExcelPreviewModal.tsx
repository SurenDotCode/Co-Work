'use client';

import React from 'react';
import { FileSpreadsheet, X, CheckCircle2, AlertTriangle, Download, Table2 } from 'lucide-react';
import { ExcelPreviewData } from '@/lib/types';

interface ExcelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  taskTitle: string;
  memberName: string;
  uploadedAt: string;
  previewData?: ExcelPreviewData;
}

export const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  taskTitle,
  memberName,
  uploadedAt,
  previewData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel-glow border border-slate-700/80 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{fileName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {previewData?.sheetName || 'Sheet1'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted by <span className="text-slate-200 font-medium">{memberName}</span> for &quot;{taskTitle}&quot;
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

        {/* Stats bar if present */}
        {previewData?.summaryStats && (
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Table2 className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-[11px] text-slate-400">Data Rows</div>
                <div className="text-sm font-bold text-white font-mono">{previewData.summaryStats.totalRows} Verified</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[11px] text-emerald-400">Tolerance Passed</div>
                <div className="text-sm font-bold text-emerald-300 font-mono">
                  {previewData.summaryStats.passedChecks ?? previewData.summaryStats.totalRows} / {previewData.summaryStats.totalRows}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[11px] text-amber-400">Flagged Deviations</div>
                <div className="text-sm font-bold text-amber-300 font-mono">
                  {previewData.summaryStats.flaggedTolerances ?? 0} Flagged
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 mt-2">
          {previewData && previewData.rows && previewData.rows.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0">
                  <th className="p-3 font-semibold text-slate-300">#</th>
                  {previewData.columns.map((col) => (
                    <th key={col} className="p-3 font-semibold text-slate-300 whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {previewData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    {previewData.columns.map((col) => {
                      const val = row[col];
                      const isWarning = String(val).includes('WARNING') || String(val).includes('FAIL');
                      const isPassed = String(val) === 'PASSED' || String(val) === 'VERIFIED';

                      return (
                        <td key={col} className="p-3 whitespace-nowrap">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              {val}
                            </span>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                              <AlertTriangle className="w-3 h-3" />
                              {val}
                            </span>
                          ) : (
                            <span>{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Binary Document Preview</p>
              <p className="text-xs text-slate-400 mt-1">This file has been recorded and verified by the host.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Uploaded on <span className="text-slate-300">{new Date(uploadedAt).toLocaleString()}</span>
          </div>
          <button
            onClick={() => {
              // Simulated download
              const element = document.createElement('a');
              const file = new Blob([JSON.stringify(previewData || {}, null, 2)], { type: 'application/json' });
              element.href = URL.createObjectURL(file);
              element.download = fileName;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Source File
          </button>
        </div>
      </div>
    </div>
  );
};
