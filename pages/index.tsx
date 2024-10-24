import React, { useState } from 'react';
import { FileText, BarChart2, Database, AlertTriangle, Download, RefreshCw, Settings, Lock, Unlock } from 'lucide-react';
import Head from 'next/head';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  fetchService,
} from '../services/fetchService';
import { FileInputComponent } from '../components/FileUploadComponent';
import { DataVisualizerComponent } from '../components/DataVisualizerComponent';
import { CorrelationColumnRemover } from '../analyzers/CorrelationColumnRemover';
import { BenfordAnalyzer } from '../analyzers/BenfordAnalyzer';
import { AnomalyDetectorComponent } from '../analyzers/AnomalyDetector';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DraggablePanel = ({ title, children, icon: Icon, isLayoutLocked }) => {
  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden relative">
      <div className={`p-4 border-b border-gray-200 ${!isLayoutLocked ? 'cursor-move' : ''} bg-white sticky top-0 z-10`}>
        <div className="flex items-center space-x-2">
          <Icon className="text-indigo-400" size={20} />
          <h2 className="text-xl font-semibold font-display text-indigo-600">
            {title}
          </h2>
        </div>
      </div>
      <div className="p-6 overflow-auto h-[calc(100%-4rem)] relative">
        {children}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
    <Icon size={48} className="text-indigo-300 mb-4" />
    <p className="text-gray-500 font-body text-center">{text}</p>
  </div>
);

const AnalyzerCard = ({ title, icon: Icon, description, onClick, active }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-4 transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-500 shadow-lg' 
        : 'bg-white border border-gray-200 hover:border-indigo-300'
    } hover:shadow-xl transform hover:-translate-y-1`}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-lg ${
        active 
          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
          : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
      }`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 font-display">{title}</h3>
        <p className="text-sm text-gray-500 font-body">{description}</p>
      </div>
    </div>
  </div>
);

export default function MainPage() {
  const [fileID, setFileID] = useState(null);
  const [dataView, setDataView] = useState(null);
  const [activeAnalyzer, setActiveAnalyzer] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [benfordResults, setBenfordResults] = useState(null);
  const [anomalyResults, setAnomalyResults] = useState(null);
  const [activeAnalyzerType, setActiveAnalyzerType] = useState(null);
  const [isLayoutLocked, setIsLayoutLocked] = useState(false);

  const defaultLayout = {
    lg: [
      { i: 'analyzers', x: 0, y: 0, w: 3, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'visualization', x: 3, y: 0, w: 6, h: 12, minW: 3, minH: 6, maxH: 24 },
      { i: 'options', x: 9, y: 0, w: 3, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'results', x: 0, y: 12, w: 12, h: 12, minW: 6, minH: 6, maxH: 24 }
    ],
    md: [
      { i: 'analyzers', x: 0, y: 0, w: 4, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'visualization', x: 4, y: 0, w: 8, h: 12, minW: 3, minH: 6, maxH: 24 },
      { i: 'options', x: 0, y: 12, w: 4, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'results', x: 4, y: 12, w: 8, h: 12, minW: 6, minH: 6, maxH: 24 }
    ],
    sm: [
      { i: 'analyzers', x: 0, y: 0, w: 6, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'visualization', x: 6, y: 0, w: 6, h: 12, minW: 3, minH: 6, maxH: 24 },
      { i: 'options', x: 0, y: 12, w: 6, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'results', x: 6, y: 12, w: 6, h: 12, minW: 4, minH: 6, maxH: 24 }
    ],
    xs: [
      { i: 'analyzers', x: 0, y: 0, w: 12, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'visualization', x: 0, y: 12, w: 12, h: 12, minW: 3, minH: 6, maxH: 24 },
      { i: 'options', x: 0, y: 24, w: 12, h: 12, minW: 2, minH: 6, maxH: 24 },
      { i: 'results', x: 0, y: 36, w: 12, h: 12, minW: 4, minH: 6, maxH: 24 }
    ]
  };

  const [layouts, setLayouts] = useState(defaultLayout);

  const handleFileUpload = async (uploadedFileID) => {
    setActiveAnalyzer(null);
    setAnalysisResults(null);
    setBenfordResults(null);
    setAnomalyResults(null);
    setFileID(uploadedFileID);
    
    if (uploadedFileID) {
      try {
        const visualizeData = await fetchService.visualizeFile({ id: uploadedFileID });
        setDataView(visualizeData);
      } catch (error) {
        console.error('Error visualizing file:', error);
      }
    } else {
      setDataView(null);
    }
  };

  const downloadAnomaliesCSV = () => {
    if (anomalyResults && anomalyResults.anomalies.length > 0) {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [Object.keys(anomalyResults.anomalies[0])]
          .concat(anomalyResults.anomalies.map((row) => Object.values(row)))
          .map((e) => e.join(','))
          .join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'anomalies.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const analyzers = [
    {
      id: 'correlation',
      title: 'Analiza Korelacji',
      description: 'Wykryj i usuń silnie skorelowane kolumny',
      icon: BarChart2,
      action: () => {
        setActiveAnalyzer(
          <CorrelationColumnRemover
            fileId={fileID}
            onPreview={setAnalysisResults}
            onRemove={handleFileUpload}
          />
        );
        setActiveAnalyzerType('correlation');
      }
    },
    {
      id: 'benford',
      title: 'Analiza Benforda',
      description: 'Sprawdź rozkład pierwszych cyfr',
      icon: Database,
      action: () => {
        setActiveAnalyzer(
          <BenfordAnalyzer
            fileId={fileID}
            columns={dataView?.columns || []}
            onAnalyze={(results) => {
              setAnalysisResults(null);
              setBenfordResults(results);
              setAnomalyResults(null);
            }}
          />
        );
        setActiveAnalyzerType('benford');
      }
    },
    {
      id: 'anomaly',
      title: 'Detekcja Anomalii',
      description: 'Znajdź odstające wartości',
      icon: AlertTriangle,
      action: () => {
        setActiveAnalyzer(
          <AnomalyDetectorComponent
            fileId={fileID}
            onDetect={(results) => {
              setAnalysisResults(null);
              setBenfordResults(null);
              setAnomalyResults(results);
            }}
          />
        );
        setActiveAnalyzerType('anomaly');
      }
    }
  ];

  return (
    <>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 font-body">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text font-display">
                Analytics Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isLayoutLocked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {isLayoutLocked ? (
                    <>
                      <Lock size={16} className="mr-2" />
                      <span>Układ Zablokowany</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={16} className="mr-2" />
                      <span>Układ Odblokowany</span>
                    </>
                  )}
                </button>
                <FileInputComponent gotFileIDCallback={handleFileUpload} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
            rowHeight={30}
            width={1800}
            onLayoutChange={(_, layouts) => !isLayoutLocked && setLayouts(layouts)}
            isDraggable={!isLayoutLocked}
            isResizable={!isLayoutLocked}
            draggableHandle=".cursor-move"
            margin={[12, 12]}
            containerPadding={[12, 12]}
            useCSSTransforms={true}
            preventCollision={false}
            compactType="vertical"
          >
            {/* Analyzers Panel */}
            <div key="analyzers">
              <DraggablePanel title="Dostępne Analizy" icon={BarChart2} isLayoutLocked={isLayoutLocked}>
                {fileID ? (
                  <div className="space-y-4">
                    {analyzers.map((analyzer) => (
                      <div key={analyzer.id}>
                        <AnalyzerCard
                          title={analyzer.title}
                          icon={analyzer.icon}
                          description={analyzer.description}
                          onClick={() => {
                            analyzer.action();
                            setActiveAnalyzerType(analyzer.id);
                            setBenfordResults(null);
                            setAnomalyResults(null);
                            setAnalysisResults(null);
                          }}
                          active={activeAnalyzerType === analyzer.id}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    text="Wgraj plik, aby zobaczyć dostępne analizy"
                  />
                )}
              </DraggablePanel>
            </div>

            {/* Visualization Panel */}
            <div key="visualization">
              <DraggablePanel title="Wizualizacja Danych" icon={FileText} isLayoutLocked={isLayoutLocked}>
                {dataView ? (
                  <div className="h-full">
                    <DataVisualizerComponent data={dataView} />
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    text="Wgraj plik, aby zobaczyć podgląd danych"
                  />
                )}
              </DraggablePanel>
            </div>

            {/* Options Panel */}
            <div key="options">
              <DraggablePanel title="Parametry Analizy" icon={Settings} isLayoutLocked={isLayoutLocked}>
                {activeAnalyzer ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    {activeAnalyzer}
                  </div>
                ) : (
                  <EmptyState
                    icon={Settings}
                    text="Wybierz rodzaj analizy, aby zobaczyć dostępne opcje"
                  />
                )}
              </DraggablePanel>
            </div>

            {/* Results Panel */}
            <div key="results">
              <DraggablePanel title="Wyniki Analizy" icon={Database} isLayoutLocked={isLayoutLocked}>
                {anomalyResults ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold font-display text-gray-800">
                        Wykryte Anomalie
                      </h3>
                      <button
                        onClick={downloadAnomaliesCSV}
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <Download size={16} />
                        <span>Pobierz CSV</span>
                      </button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                      <p className="text-gray-700">
                        Znaleziono anomalie w {anomalyResults.anomaly_count} z {anomalyResults.total_count} wierszy.
                      </p>
                    </div>

                    {anomalyResults.anomalies.length > 0 && (
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(anomalyResults.anomalies[0]).map((col) => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {anomalyResults.anomalies.map((row, idx) => (
                              <tr key={idx} className="hover:bg-indigo-50/30">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {typeof value === "number" ? value.toFixed(2) : value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : benfordResults ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                        <p className="text-sm text-gray-500 mb-1">
                          Statystyka Chi-kwadrat
                        </p>
                        <p className="text-3xl font-bold text-gray-800">
                          {benfordResults.chi_stat.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                        <p className="text-sm text-gray-500 mb-1">
                          P-value
                        </p>
                        <p className="text-3xl font-bold text-gray-800">
                          {benfordResults.p_value.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                      <img
                        src={`data:image/png;base64,${benfordResults.plot}`}
                        alt="Wykres Benforda"
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                ) : analysisResults ? (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                    <div className="prose prose-indigo max-w-none">
                      {analysisResults}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={RefreshCw}
                    text="Wybierz rodzaj analizy, aby zobaczyć wyniki"
                  />
                )}
              </DraggablePanel>
            </div>
          </ResponsiveGridLayout>
        </div>

        {/* Loading Indicator */}
        <div className="fixed bottom-4 right-4">
          {dataView === null && fileID && (
            <div className="bg-white rounded-full p-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Style globalne */}
      <style jsx global>{`
        .font-display {
          font-family: 'Outfit', sans-serif;
        }
        .font-body {
          font-family: 'Inter', sans-serif;
        }

        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
        }

        .react-grid-item {
          touch-action: none;
        }

        .react-grid-item.cssTransforms {
          transition-property: transform;
          transition-duration: 200ms;
          transition-timing-function: ease;
        }

        .react-grid-item.resizing {
          z-index: 2;
          will-change: width, height;
        }

        .react-grid-item.react-draggable-dragging {
          z-index: 3;
          will-change: transform;
          cursor: grabbing !important;
        }

        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0;
          transition: opacity 200ms ease;
        }

        .react-grid-item:hover > .react-resizable-handle {
          opacity: 1;
        }

        .react-grid-item > .react-resizable-handle::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 8px;
          height: 8px;
          background-color: rgba(99, 102, 241, 0.5);
          border: 2px solid rgba(99, 102, 241, 0.8);
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }

        .cursor-move {
          cursor: move;
        }

        ${isLayoutLocked ? `
          .react-grid-item > .react-resizable-handle {
            display: none;
          }
          .cursor-move {
            cursor: default;
          }
        ` : ''}
      `}</style>
    </>
  );
}
