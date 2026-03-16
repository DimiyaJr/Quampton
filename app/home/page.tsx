"use client";

import { title } from "@/components/primitives";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import API_ENDPOINTS from "../API"; // Ensure correct path

interface SalesDataType {
  date?: string;
  month?: string;
  year?: string;
  total_net: string;
}

export default function HomePage() { // Fixed function name
  const [salesData, setSalesData] = useState<SalesDataType[]>([]); // Ensure array type
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("daily"); // Default grouping: daily

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const url =
        groupBy === "yearly"
          ? API_ENDPOINTS.SALES_YEARLY
          : groupBy === "monthly"
          ? API_ENDPOINTS.SALES_MONTHLY
          : API_ENDPOINTS.SALES_DAILY;

      const res = await fetch(url);
      const data = await res.json();
      setSalesData(data.data[0] || []); // Ensure it's an array
      console.log(data.data[0])
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchSalesData();
  }, [groupBy]);

  const chartData = {
    labels: salesData.map((item) =>
      groupBy === "yearly"
        ? item.year
        : groupBy === "monthly"
        ? item.month
        : item.date?.split('T')[0]
    ),
    datasets: [
      {
        label: "Net Sales",
        data: salesData.map((item) => item.total_net),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
  const totalSales = salesData.reduce((sum, item) => sum + parseFloat(item.total_net), 0);

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>

      {/* Filters */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Group By:</label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="block w-64 p-2 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500">Total Sales</p>
          <h2 className="text-2xl font-semibold">${totalSales}</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500">Orders</p>
          <h2 className="text-2xl font-semibold">{salesData.length}</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500">Top Product</p>
          <h2 className="text-2xl font-semibold">N/A</h2>
        </div>
      </div>

      {/* Graphs Section */}
      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : salesData.length === 0 ? (
        <p className="text-lg font-semibold">No data available</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 w-full max-w-6xl">
          {/* Sales Over Time (Line Chart) */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full h-[50vh] overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Sales Over Time</h2>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>

        </div>
      )}

      {/* Recent Transactions */}
      <div className="w-full max-w-6xl mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-gray-700">Month</th>
              <th className="p-3 text-left text-gray-700">Total Net</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{item.month}</td>
                <td className="p-3">${item.total_net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}