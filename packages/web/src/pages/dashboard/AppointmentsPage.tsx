import { Clock, Plus } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="heading-2">Clinical Appointments</h2>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Schedule Visit</span>
        </button>
      </div>
      
      <div className="card text-center py-20">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-700">No appointments scheduled for today</h3>
        <p className="text-gray-400">All clinical sessions are currently clear.</p>
      </div>
    </div>
  );
}
