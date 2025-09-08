'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { generateAndStoreVisualizations } from '@/actions/visualizations';

interface VisualizationsProps {
  researchQueryId: string;
  initialVisualizations: any;
  researchQuery: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Visualizations: React.FC<VisualizationsProps> = ({ researchQueryId, initialVisualizations, researchQuery }) => {
  const [visualizations, setVisualizations] = useState(initialVisualizations?.visualizations || []);
  const [loading, setLoading] = useState(false);

  const handleGenerateVisualizations = useCallback(async () => {
    setLoading(true);
    try {
      const vizData = await generateAndStoreVisualizations(researchQueryId, researchQuery);
      setVisualizations(vizData.visualizations);
    } catch (error) {
      console.error('Failed to generate visualizations:', error);
    }
    setLoading(false);
  }, [researchQueryId, researchQuery]);

  useEffect(() => {
    if (!initialVisualizations) {
      handleGenerateVisualizations();
    }
  }, [initialVisualizations, handleGenerateVisualizations]);

  const renderChart = (viz: any, index: number) => {
    switch (viz.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300} key={index}>
            <BarChart data={viz.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name"  className='w-1/2'/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#065f46" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={viz.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {viz.data.map((entry: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        case 'line':
            return (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viz.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            );
      default:
        return <p>Unsupported chart type: {viz.type}</p>;
    }
  };

  return (
    <div>
      <button onClick={handleGenerateVisualizations} disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded-md mb-4">
        {loading ? 'Generating...' : 'Regenerate Visualizations'}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visualizations.map((viz: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">{viz.title}</h3>
            {renderChart(viz, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Visualizations;
