import React, { useState, useCallback } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import { ColumnFormat } from '@/types/fieldTypes';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnFormat[];
  onImport: (mappedData: any[]) => Promise<void>;
  type: string;
}

const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Push the last value
  values.push(currentValue.trim());
  
  return values;
};

const CSVImportModal = ({ isOpen, onClose, columns, onImport, type }: CSVImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);
        
        // Get preview data (first 5 rows)
        const preview = lines.slice(1, 6).map(line => parseCSVLine(line));

        setHeaders(headers);
        setPreviewData(preview);
        
        // Initialize mappings with empty values
        const initialMappings = headers.reduce((acc, header) => {
          acc[header] = '';
          return acc;
        }, {} as Record<string, string>);
        setMappings(initialMappings);
      } catch (err) {
        setError('Failed to parse CSV file');
        console.error(err);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = parseCSVLine(lines[0]);
      
      // Convert CSV data to array of objects using mappings
      const data = lines.slice(1)
        .map(line => {
          const values = parseCSVLine(line);
          const obj: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            const mappedColumn = mappings[header];
            if (mappedColumn) {
              obj[mappedColumn] = values[index];
            }
          });
          
          return obj;
        });

      await onImport(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#191919] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Import {type} from CSV
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!file ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <FiUpload size={24} className="text-gray-400" />
                <span className="text-gray-300">Click to upload CSV file</span>
                <span className="text-sm text-gray-500">or drag and drop</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>File:</span>
                <span className="font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setMappings({});
                    setPreviewData([]);
                  }}
                  className="text-gray-400 hover:text-red-400"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Map CSV columns to {type} fields
                </h3>
                <div className="space-y-3">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 min-w-[150px]">
                        {header}
                      </span>
                      <select
                        value={mappings[header]}
                        onChange={(e) => setMappings(prev => ({
                          ...prev,
                          [header]: e.target.value
                        }))}
                        className="flex-1 bg-[#2f2f2f] text-sm text-gray-300 rounded px-2 py-1 border border-gray-600"
                      >
                        <option value="">-- Skip this column --</option>
                        {columns.map((col) => (
                          <option key={col.key} value={col.key}>
                            {col.fieldConfig.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {previewData.length > 0 && (
                <div className="border border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Preview (first 5 rows)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400">
                        <tr>
                          {headers.map((header) => (
                            <th key={header} className="px-3 py-2 text-left">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {previewData.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-2 border-t border-gray-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !file || Object.values(mappings).every(v => !v)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CSVImportModal; 