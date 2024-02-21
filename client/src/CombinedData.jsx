import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import { Pie, Bar } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

function CombinedData({ data }) {
  const [statistics, setStatistics] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/combined-data",
          {
            params: { month:  data || 3 },
          },
        );

        const { statistics, barChartData, pieChartData } = response.data;

        setStatistics(statistics);
        setBarChartData(barChartData);
        setPieChartData(pieChartData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [data]);

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  return (
    <div className="container">
      <h1>Statistics {data}</h1>
      <div className="stats">
        {statistics && (
          <div>
            <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
            <p>Sold Items: {statistics.soldItems}</p>
            <p>Not Sold Items: {statistics.notSoldItems}</p>
          </div>
        )}
      </div>
      <h1>Bar Chart Data</h1>
      <div className="barchart">
        <div className="data">
        {barChartData && (
          <ul>
            {barChartData.map((item) => (
              <li key={item.range}>{`${item.range}: ${item.count} items`}</li>
            ))}
          </ul>
        )}
        </div>
        <div className="chart">
        {pieChartData && (
          <Bar
            data={{
              labels: pieChartData.map((item) => item.category),
              datasets: [{
                data: pieChartData.map((item) => item.count),
                backgroundColor: pieChartData.map(() => generateRandomColor()),
              }],
            }}
            options={{
              title: {
                display: true,
                text: 'Class Strength',
                fontSize: 20,
              },
              legend: {
                display: true,
                position: 'right',
              },
            }}
          />
        )}
        </div>
      </div>
      <h1>Pie Chart Data</h1>
      <div className="piechart">
        <div className="data">
        {pieChartData && (
          <ul>
            {pieChartData.map((item) => (
              <li key={item.category}>{`${item.category}: ${item.count} items`}</li>
            ))}
          </ul>
        )}
        </div>
        <div className="chart">
        {pieChartData && (
          <Pie
            data={{
              labels: pieChartData.map((item) => item.category),
              datasets: [{
                data: pieChartData.map((item) => item.count),
                backgroundColor: pieChartData.map(() => generateRandomColor()),
              }],
            }}
            options={{
              title: {
                display: true,
                text: 'Class Strength',
                fontSize: 20,
              },
              legend: {
                display: true,
                position: 'right',
              },
            }}
          />
        )}
        </div>
      </div>
    </div>
  );
}

export default CombinedData;
