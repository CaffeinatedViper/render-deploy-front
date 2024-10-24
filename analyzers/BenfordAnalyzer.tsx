import React, { useState, useEffect } from 'react';
import { fetchService, BENFORD_ANALYZE_RQ, BENFORD_ANALYZE_RS } from '../services/fetchService';
import { UUID } from 'crypto';

export type BenfordAnalyzerProps = {
    fileId: UUID;
    columns: string[];
    onAnalyze: (results: BENFORD_ANALYZE_RS) => void;
}

export const BenfordAnalyzer: React.FC<BenfordAnalyzerProps> = ({ fileId, columns, onAnalyze }) => {
    const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || '');
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = () => {
        const rq: BENFORD_ANALYZE_RQ = {
            id: fileId,
            column: selectedColumn
        };
        fetchService.benfordAnalyze(rq)
            .then(onAnalyze)
            .catch(err => setError('Error during analysis'));
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Analiza Prawa Benforda</h2>

            <div className="space-y-4">
                <div>
                    <p className="font-medium mb-2">Wybierz kolumnę do analizy:</p>
                    <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>

                {error && <div className="text-red-500">{error}</div>}

                <div className="pt-2">
                    <button
                        onClick={handleAnalyze}
                        className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Przeprowadź analizę
                    </button>
                </div>
            </div>
        </div>
    );
}
