import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Vital } from "@medical-app/shared";

interface VitalsChartProps {
  data: Vital[];
  type: "temperature" | "pulse" | "bp" | "oxygenSaturation";
  title: string;
}

export default function VitalsChart({ data, type, title }: VitalsChartProps) {
  // Process data for Recharts
  const chartData = [...data]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((v) => ({
      time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(v.recordedAt).toLocaleDateString(),
      value: type === "bp" ? v.bloodPressureSystolic : v[type],
      systolic: v.bloodPressureSystolic,
      diastolic: v.bloodPressureDiastolic,
    }));

  return (
    <div className="card h-64 flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            {type === "bp" ? (
              <>
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Systolic"
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Diastolic"
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={type === "temperature" ? "#ef4444" : "#0284c7"}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={title}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
