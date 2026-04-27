import { BarChart2, TrendingUp, AlertCircle } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="heading-2">Clinical Intelligence</h2>
        <div className="flex space-x-2">
           <button className="btn-secondary text-xs font-bold">EXPORT DATA</button>
           <button className="btn-primary text-xs font-bold">GENERATE AUDIT</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard title="Total Admissions" value="1,284" icon={<BarChart2 />} trend="+12%" />
        <ReportCard title="Recovery Rate" value="94.2%" icon={<TrendingUp />} trend="+2.1%" />
        <ReportCard title="Critical Cases" value="14" icon={<AlertCircle />} trend="-3" color="red" />
      </div>

      <div className="card h-96 flex items-center justify-center text-gray-300">
        Analytics visualization placeholder
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon, trend, color = "blue" }: any) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color === 'red' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black ${trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="label-text">{title}</p>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}
