import React from 'react';
import { VISUALIZE_FILE_RS } from "../services/fetchService";

export type DataVisualizerComponentProps = {
    data : VISUALIZE_FILE_RS;
}

export const DataVisualizerComponent = ({ data }: DataVisualizerComponentProps) => {
    const { length, columns, head, tail } = data;

    const renderTableHeader = () => (
        <tr>
            <th key={-1}>ID</th>
            {columns.map((column, index) => <th key={index}>{column}</th>)}
        </tr>
    );

    const renderTableRow = (row: string[], index: number, begin:number) => (
        <tr key={index}>
            <td key={-1}>{begin+index}</td>
            {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
        </tr>
    );

    return (
        <div className="dataVisualizerTable">
            <table>
                <thead>
                    {renderTableHeader()}
                </thead>
                <tbody>
                    {head.map((row,index) => renderTableRow(row,index,0))}
                    {tail.map((row,index) => renderTableRow(row,index,length-tail.length))}
                </tbody>
            </table>
        </div>
    );
};