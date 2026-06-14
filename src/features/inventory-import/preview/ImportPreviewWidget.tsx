'use client';

import React, { useState } from 'react';
import { FileUp, AlertCircle, CheckCircle, UploadCloud, Loader2, ArrowRight, Save } from 'lucide-react';
import { importPipelineService } from '../services/import.service';
import { ImportPipelineResult } from '../pipeline/import.types';

export const ImportPreviewWidget = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'validating' | 'preview' | 'committing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [pipelineResult, setPipelineResult] = useState<ImportPipelineResult | null>(null);
  const [commitCount, setCommitCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setPipelineResult(null);
      setErrorMsg('');
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    try {
      setStatus('parsing');
      const rawProducts = await importPipelineService.uploadAndParsePDF(file);
      
      setStatus('validating');
      const result = await importPipelineService.processPreview(rawProducts);
      
      setPipelineResult(result);
      setStatus('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during processing.');
      setStatus('error');
    }
  };

  const handleCommit = async () => {
    if (!pipelineResult || pipelineResult.validCount === 0) return;
    try {
      setStatus('committing');
      const count = await importPipelineService.commitValidProducts(pipelineResult.products);
      setCommitCount(count);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during commit.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setPipelineResult(null);
    setCommitCount(0);
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileUp className="h-6 w-6 text-[#006970]" />
          Bulk Product Import
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload supplier PDFs to automatically parse, validate, and import products into your inventory.
        </p>
      </div>

      {/* Upload Box */}
      {status === 'idle' && (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select a PDF to import</p>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#006970]/10 file:text-[#006970] hover:file:bg-[#006970]/20"
          />
          {file && (
            <button 
              onClick={handleProcess}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#006970] text-white rounded-xl hover:bg-[#005a60] transition-colors font-medium"
            >
              Start Processing <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Processing States */}
      {(status === 'parsing' || status === 'validating' || status === 'committing') && (
        <div className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
          <Loader2 className="w-10 h-10 animate-spin text-[#006970] mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {status === 'parsing' ? 'Extracting data from PDF...' : 
             status === 'validating' ? 'Validating against ERP rules...' : 
             'Committing to database...'}
          </h3>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments. Please do not close the window.</p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center py-12 border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Import Failed</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1 mb-4">{errorMsg}</p>
          <button onClick={reset} className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm font-medium hover:bg-gray-50">
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="flex flex-col items-center justify-center py-12 border border-emerald-100 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800/30 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
          <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-400">Import Complete!</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1 mb-4">Successfully committed {commitCount} products to the inventory.</p>
          <button onClick={reset} className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm font-medium hover:bg-gray-50">
            Import Another File
          </button>
        </div>
      )}

      {/* Preview Layer */}
      {status === 'preview' && pipelineResult && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Total Extracted</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{pipelineResult.totalExtracted}</div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800/30">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Valid & Ready</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{pipelineResult.validCount}</div>
            </div>
            <div className="p-4 rounded-xl border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30">
              <div className="text-xs text-red-600 dark:text-red-400 mb-1">Conflicts Found</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{pipelineResult.errorCount}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Validation Preview</h3>
              <button 
                onClick={handleCommit}
                disabled={pipelineResult.validCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-[#006970] text-white rounded-lg hover:bg-[#005a60] transition-colors font-medium text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Commit Valid Products ({pipelineResult.validCount})
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 uppercase">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pipelineResult.products.map((p, idx) => (
                    <tr key={idx} className={!p.isValid ? 'bg-red-50/50 dark:bg-red-900/5' : ''}>
                      <td className="px-4 py-3">
                        {p.isValid ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                              <AlertCircle className="w-3.5 h-3.5" /> Conflict
                            </span>
                            <span className="text-[10px] text-red-500">{p.errors.join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{p.sku}</code></td>
                      <td className="px-4 py-3 text-right">PKR {p.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
