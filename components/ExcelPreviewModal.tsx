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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-xl bg-white border border-slate-200 p-6 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-mono">{fileName}</h2>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {previewData?.sheetName || 'Sheet1'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Submitted by <strong className="text-slate-800">{memberName}</strong> for &quot;{taskTitle}&quot;
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

        {/* Stats */}
        {previewData?.summaryStats && (
          <div className="grid grid-cols-3 gap-2 my-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Total Rows</div>
              <div className="font-bold text-slate-900 font-mono">{previewData.summaryStats.totalRows} Verified</div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] text-emerald-800 font-medium">Tolerance Passed</div>
              <div className="font-bold text-emerald-900 font-mono">
                {previewData.summaryStats.passedChecks ?? previewData.summaryStats.totalRows} / {previewData.summaryStats.totalRows}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-[10px] text-amber-800 font-medium">Flagged Deviations</div>
              <div className="font-bold text-amber-900 font-mono">
                {previewData.summaryStats.flaggedTolerances ?? 0} Flagged
              </div>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50/50 mt-1">
          {previewData && previewData.rows && previewData.rows.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0">
                  <th className="p-2.5 font-bold">#</th>
                  {previewData.columns.map((col) => (
                    <th key={col} className="p-2.5 font-bold whitespace-nowrap">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {previewData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white bg-white/70">
                    <td className="p-2.5 text-slate-400">{idx + 1}</td>
                    {previewData.columns.map((col) => {
                      const val = row[col];
                      const isWarning = String(val).includes('WARNING') || String(val).includes('FAIL');
                      const isPassed = String(val) === 'PASSED' || String(val) === 'VERIFIED';

                      return (
                        <td key={col} className="p-2.5 whitespace-nowrap">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              {val}
                            </span>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
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
            <div className="p-8 text-center text-slate-500 text-xs">
              Document recorded and stored.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Source
          </button>
        </div>
      </div>
    </div>
  );
};
