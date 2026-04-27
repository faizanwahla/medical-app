import { useAuthStore } from "../../lib/store";
import { User, Bell, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { logout } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="heading-2">System Configuration</h2>

      <div className="space-y-4">
        <SettingItem 
          icon={<User className="w-5 h-5" />} 
          title="Clinical Profile" 
          desc="Update your professional credentials and specialty"
        />
        <SettingItem 
          icon={<Bell className="w-5 h-5" />} 
          title="Notifications" 
          desc="Configure critical alert thresholds and system pings"
        />
        <SettingItem 
          icon={<Shield className="w-5 h-5" />} 
          title="Security" 
          desc="Manage password and two-factor authentication"
        />
        
        <div className="pt-6">
          <button 
            onClick={logout}
            className="btn-danger w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Terminate Current Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, desc }: any) {
  return (
    <div className="card flex items-center space-x-4 hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 group-hover:text-medical-600">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
