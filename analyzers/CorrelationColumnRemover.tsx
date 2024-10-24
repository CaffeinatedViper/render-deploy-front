import React, { useState } from "react";
import { CORRELATION_COLUMN_PREVIEW_RQ, fetchService } from "../services/fetchService";
import { UUID } from "crypto";

export type CorrelationColumnRemoverProps = {
    onPreview: (columns: string) => void;
    onRemove: (newId: UUID) => void;
    fileId: UUID;
}

export const CorrelationColumnRemover: React.FC<CorrelationColumnRemoverProps> = ({ onPreview, onRemove, fileId }) => {
    const [method, setMethod] = useState<CORRELATION_COLUMN_PREVIEW_RQ['method']>('pearson');
    const [selectionMethod, setSelectionMethod] = useState<CORRELATION_COLUMN_PREVIEW_RQ['selection_method']>('variance');
    const [threshold, setThreshold] = useState<number>(0.9);

    const setThresholdWrapper = (value: string) => {
        setThreshold(Math.min(1, Math.max(Number(value), 0)));
    }

    const preview = () => {
        fetchService.previewCorrelatedColumns({ method, selection_method: selectionMethod, id: fileId, threshold })
            .then(rs => rs.columns_to_remove)
            .then(cols => "Columns to remove: " + cols.join(", "))
            .then(onPreview);
    }

    const remove = () => {
        fetchService.removeCorrelatedColumns({ method, selection_method: selectionMethod, id: fileId, threshold })
            .then(rs => rs.id)
            .then(onRemove);
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Parametry wybranej opcji</h2>
            
            <div className="space-y-4">
                <div>
                    <p className="font-medium mb-2">Method</p>
                    <div className="flex space-x-4">
                        {['pearson', 'spearman', 'kendall'].map((m) => (
                            <label key={m} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="method"
                                    value={m}
                                    checked={method === m}
                                    onChange={() => setMethod(m as CORRELATION_COLUMN_PREVIEW_RQ['method'])}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2 capitalize">{m}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="font-medium mb-2">Threshold</p>
                    <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThresholdWrapper(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        max="1"
                        step="0.1"
                    />
                </div>

                <div>
                    <p className="font-medium mb-2">Selection Method</p>
                    <div className="flex space-x-4">
                        {['variance', 'missing_values', 'cardinality'].map((sm) => (
                            <label key={sm} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="selectionMethod"
                                    value={sm}
                                    checked={selectionMethod === sm}
                                    onChange={() => setSelectionMethod(sm as CORRELATION_COLUMN_PREVIEW_RQ['selection_method'])}
                                    className="form-radio text-blue-600"
                                />
                                <span className="ml-2 capitalize">{sm.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={preview}
                        className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
}