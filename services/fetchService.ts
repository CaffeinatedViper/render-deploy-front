import { UUID } from 'crypto';

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set, using default:', SERVER_URL);
}


const sendRequest = <Rs>(endpoint: string, body: any): Promise<Rs> => {
  return fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
    },
  }).then((rs) =>
    rs.ok ? (rs.json() as Promise<Rs>) : rs.json().then((err) => Promise.reject(err))
  );
};


const UPLOAD_FILE_ENDPOINT = SERVER_URL + '/data/upload';
export type UPLOAD_FILE_RS = { id: UUID };
const uploadFile = (file: File): Promise<UPLOAD_FILE_RS> => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch(UPLOAD_FILE_ENDPOINT, {
    method: 'POST',
    body: formData,
  }).then((rs) =>
    rs.ok ? (rs.json() as Promise<UPLOAD_FILE_RS>) : rs.json().then((err) => Promise.reject(err))
  );
};


const VISUALIZE_FILE_ENDPOINT = SERVER_URL + '/data/visualize';
export type VISUALIZE_FILE_RQ = { id: UUID };
export type VISUALIZE_FILE_RS = {
  length: number;
  columns: string[];
  head: string[][];
  tail: string[][];
};
const visualizeFile = (rq: VISUALIZE_FILE_RQ): Promise<VISUALIZE_FILE_RS> => {
  return sendRequest<VISUALIZE_FILE_RS>(VISUALIZE_FILE_ENDPOINT, rq);
};

const CORRELATION_COLUMN_PREVIEW_ENDPOINT =
  SERVER_URL + '/data/correlation/preview_preprocess';
export type CORRELATION_COLUMN_PREVIEW_RQ = {
  id: UUID;
  method: 'pearson' | 'spearman' | 'kendall';
  selection_method: 'variance' | 'missing_values' | 'cardinality';
  threshold: number;
};
export type CORRELATION_COLUMN_PREVIEW_RS = {
  columns_to_remove: string[];
};
const previewCorrelatedColumns = (
  rq: CORRELATION_COLUMN_PREVIEW_RQ
): Promise<CORRELATION_COLUMN_PREVIEW_RS> => {
  return sendRequest<CORRELATION_COLUMN_PREVIEW_RS>(CORRELATION_COLUMN_PREVIEW_ENDPOINT, rq);
};

const CORRELATION_COLUMN_REMOVE_ENDPOINT = SERVER_URL + '/data/correlation/preprocess';
export type CORRELATION_COLUMN_REMOVE_RQ = {
  id: UUID;
  method: 'pearson' | 'spearman' | 'kendall';
  selection_method: 'variance' | 'missing_values' | 'cardinality';
  threshold: number;
};
export type CORRELATION_COLUMN_REMOVE_RS = {
  id: UUID;
};
const removeCorrelatedColumns = (
  rq: CORRELATION_COLUMN_REMOVE_RQ
): Promise<CORRELATION_COLUMN_REMOVE_RS> => {
  return sendRequest<CORRELATION_COLUMN_REMOVE_RS>(CORRELATION_COLUMN_REMOVE_ENDPOINT, rq);
};

const BENFORD_ANALYZE_ENDPOINT = SERVER_URL + '/data/benford/analyze';
export type BENFORD_ANALYZE_RQ = {
  id: UUID;
  column: string;
};
export type BENFORD_ANALYZE_RS = {
  empirical_probs: { [digit: string]: number };
  benford_probs: { [digit: string]: number };
  chi_stat: number;
  p_value: number;
  plot: string; 
};


const benfordAnalyze = (rq: BENFORD_ANALYZE_RQ): Promise<BENFORD_ANALYZE_RS> => {
  return sendRequest<BENFORD_ANALYZE_RS>(BENFORD_ANALYZE_ENDPOINT, rq);
};

export type ANOMALY_DETECT_RQ = {
    id: UUID;
    contamination: number;
};

export type ANOMALY_DETECT_RS = {
    anomalies: { [index: string]: number };
    anomaly_scores: { [index: string]: number };
};

const ANOMALY_DETECT_ENDPOINT = SERVER_URL + '/data/anomaly/detect';

const detectAnomalies = (rq: ANOMALY_DETECT_RQ): Promise<ANOMALY_DETECT_RS> => {
    return sendRequest<ANOMALY_DETECT_RS>(ANOMALY_DETECT_ENDPOINT, rq);
};

export const fetchService = {
  uploadFile,
  visualizeFile,
  previewCorrelatedColumns,
  removeCorrelatedColumns,
  detectAnomalies,
  benfordAnalyze,
  
};
