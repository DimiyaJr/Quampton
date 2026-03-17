"use client";

import { Line } from "react-chartjs-2";
import "chart.js/auto";

interface Props {
  data: object;
  options?: object;
}

export default function SalesLineChart({ data, options }: Props) {
  return <Line data={data as any} options={options as any} />;
}
