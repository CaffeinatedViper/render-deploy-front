import React, { useState } from 'react';
import { fetchService, ANOMALY_DETECT_RS } from '../services/fetchService';
import { UUID } from 'crypto';

type AnomalyDetectorProps = {
    fileId: UUID;
    onDetect: (results: ANOMALY_DETECT_RS) => void;
};

export const AnomalyDetectorComponent: React.FC<AnomalyDetectorProps> = ({ fileId, onDetect }) => {
    const [contamination, setContamination] = useState<number>(0.05);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDetect = () => {
        setIsLoading(true);
        fetchService
            .detectAnomalies({ id: fileId, contamination })
            .then((results) => {
                onDetect(results);
                setIsLoading(false);
                setError(null);
            })
            .catch((err) => {
                setError('Error during anomaly detection');
                setIsLoading(false);
            });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Detekcja Anomalii</h2>

            <div className="space-y-4">
                <div>
                    <p className="font-medium mb-2">Contamination (proporcja oczekiwanych anomalii)</p>
                    <input
                        type="number"
                        value={contamination}
                        onChange={(e) => setContamination(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        max="0.5"
                        step="0.01"
                    />
                </div>

                {error && <div className="text-red-500">{error}</div>}

                <div className="pt-2">
                    <button
                        onClick={handleDetect}
                        className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Analizuję...' : 'Wykryj Anomalie'}
                    </button>
                </div>
            </div>
        </div>
    );
};
