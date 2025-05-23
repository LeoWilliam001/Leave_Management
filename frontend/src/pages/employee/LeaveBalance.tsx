// src/components/LeaveBalanceChart.tsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface LeaveBalanceChartProps {
  type: string;
  total: number;
  balance: number;
}

const LeaveBalanceChart: React.FC<LeaveBalanceChartProps> = ({ type, total, balance }) => {
  const used = total - balance;

  const data = {
    labels: ["Used", "Balance"],
    datasets: [
      {
        label: `${type} Leave`,
        data: [used, balance],
        backgroundColor: ["#FF6384", "#258acd"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div style={{ width: 250, height: 250 }}>
      <h4 style={{ textAlign: "center" }}>{type}</h4>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default LeaveBalanceChart;
