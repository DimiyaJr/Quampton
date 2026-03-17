"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import API_ENDPOINTS from "../API";

const LineChart = dynamic(
  () => import("@/components/sales-line-chart"),
  { ssr: false, loading: () => <p className="text-sm text-gray-500">Loading chart...</p> }
);

interface SalesDataType {
  date?: string;
  month?: string;
  year?: string;
  total_net: string;
}

export default function HomePage() {
  const [salesData, setSalesData] = useState<SalesDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("daily");

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
      setSalesData(data.data[0] || []);
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
        : item.date?.split("T")[0]
    ),
    datasets: [
      {
        label: "Net Sales",
        data: salesData.map((item) => item.total_net),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const totalSales = salesData.reduce((sum, item) => sum + parseFloat(item.total_net), 0);

  return (
    <div className="w-full flex flex-col items-center bg-gray-50 p-4 sm:p-6 md:p-8 pb-20 md:pb-8 overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Sales Dashboard</h1>

      <div className="mb-4 sm:mb-6 w-full max-w-5xl">
        <label className="block mb-2 text-sm font-medium text-gray-700">Group By:</label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="block w-full sm:w-64 p-2 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-5xl mb-4 sm:mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm">Total Sales</p>
          <h2 className="text-xl sm:text-2xl font-semibold">${totalSales}</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm">Orders</p>
          <h2 className="text-xl sm:text-2xl font-semibold">{salesData.length}</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm">Top Product</p>
          <h2 className="text-xl sm:text-2xl font-semibold">N/A</h2>
        </div>
      </div>

      {loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : salesData.length === 0 ? (
        <p className="text-lg font-semibold">No data available</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full max-w-6xl">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 w-full h-[40vh] sm:h-[50vh]">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Sales Over Time</h2>
            <LineChart data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mt-4 sm:mt-6 bg-white shadow-md rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[280px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 sm:p-3 text-left text-gray-700 text-sm">Month</th>
                <th className="p-2 sm:p-3 text-left text-gray-700 text-sm">Total Net</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 sm:p-3 text-sm">{item.month}</td>
                  <td className="p-2 sm:p-3 text-sm">${item.total_net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
