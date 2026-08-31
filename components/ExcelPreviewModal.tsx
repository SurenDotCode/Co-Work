'use client';

import React from 'react';
import { FileSpreadsheet, X, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-xl bg-[#111114] border border-[#27272a] p-5 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-mono">{fileName}</h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">
                  {previewData?.sheetName || 'Sheet1'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Submitted by <strong className="text-neutral-200">{memberName}</strong> for &quot;{taskTitle}&quot;
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

        {/* Stats */}
        {previewData?.summaryStats && (
          <div className="grid grid-cols-3 gap-2 my-3 text-xs">
            <div className="p-2 rounded-lg bg-[#141418] border border-[#222226]">
              <div className="text-[10px] text-neutral-400">Total Rows</div>
              <div className="font-semibold text-white font-mono">{previewData.summaryStats.totalRows} Verified</div>
            </div>

            <div className="p-2 rounded-lg bg-[#131b16] border border-emerald-900/40">
              <div className="text-[10px] text-emerald-400">Tolerance Passed</div>
              <div className="font-semibold text-emerald-300 font-mono">
                {previewData.summaryStats.passedChecks ?? previewData.summaryStats.totalRows} / {previewData.summaryStats.totalRows}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-[#1f1914] border border-amber-900/40">
              <div className="text-[10px] text-amber-400">Flagged Deviations</div>
              <div className="font-semibold text-amber-300 font-mono">
                {previewData.summaryStats.flaggedTolerances ?? 0} Flagged
              </div>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-auto rounded-lg border border-[#222226] bg-[#0c0c0e] mt-1">
          {previewData && previewData.rows && previewData.rows.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#18181c] text-neutral-400 border-b border-[#222226] sticky top-0">
                  <th className="p-2.5 font-semibold text-neutral-300">#</th>
                  {previewData.columns.map((col) => (
                    <th key={col} className="p-2.5 font-semibold text-neutral-300 whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c22] text-neutral-300">
                {previewData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#141418]">
                    <td className="p-2.5 text-neutral-500">{idx + 1}</td>
                    {previewData.columns.map((col) => {
                      const val = row[col];
                      const isWarning = String(val).includes('WARNING') || String(val).includes('FAIL');
                      const isPassed = String(val) === 'PASSED' || String(val) === 'VERIFIED';

                      return (
                        <td key={col} className="p-2.5 whitespace-nowrap">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[10px]">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {val}
                            </span>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40 text-[10px]">
                              <AlertTriangle className="w-2.5 h-2.5" />
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
            <div className="p-8 text-center text-neutral-500 text-xs">
              Document recorded and stored.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222226] text-xs text-neutral-400">
          <div>
            Uploaded: {new Date(uploadedAt).toLocaleString()}
          </div>
          <button
            onClick={() => {
              const element = document.createElement('a');
              const file = new Blob([JSON.stringify(previewData || {}, null, 2)], { type: 'application/json' });
              element.href = URL.createObjectURL(file);
              element.download = fileName;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-neutral-200 font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
