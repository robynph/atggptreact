import React, { useEffect, useRef } from 'react';
import { Line } from '@antv/g2plot';

export default function Start() {
  const chartRef = useRef(null);
  const containerRef = useRef(null); // reference for the container div

  useEffect(() => {
    renderChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  const renderChart = () => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json')
      .then((res) => res.json())
      .then((data) => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        if (containerRef.current) {
          const chart = new Line(containerRef.current, {
            data,
            padding: 'auto',
            xField: 'Date',
            yField: 'scales',
            xAxis: {
              // type: 'timeCat',
              tickCount: 5,
            },
          });

          chart.render();
          chartRef.current = chart;
        }
      });
  };

  return (
    <div>
      <h1>Walkthrough / Tutorial page</h1>
      <div id="container" ref={containerRef}></div> {/* Add ref to the div */}
    </div>
  );
}