import { useState } from 'react';
import { LogOut, Lock, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockUser, mockPatientProfile } from '@/lib/mockData';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    educationUpdates: true,
    weeklySummary: false,
  });

  const displayUser = user || mockUser;
  const initials = `${displayUser.firstName[0]}${displayUser.lastName[0]}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              {displayUser.firstName} {displayUser.lastName}
            </h1>
            <p className="text-sm text-[#64748B]">
              Patient since {new Date(mockUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={displayUser.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={displayUser.lastName} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={displayUser.email} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={mockUser.phone || ''} type="tel" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input defaultValue={mockPatientProfile.dateOfBirth} type="date" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input defaultValue={mockPatientProfile.location} />
              </div>
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Treatment Information */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Treatment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Treatment Plan</p>
                <p className="mt-1 text-sm text-[#0F172A]">{mockPatientProfile.planName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Chemo Day</p>
                <p className="mt-1 text-sm text-[#0F172A]">{mockPatientProfile.chemoDay}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Next Chemo Date</p>
                <p className="mt-1 text-sm text-[#0F172A]">
                  {new Date(mockPatientProfile.nextChemoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Cancer Type</p>
                <p className="mt-1 text-sm text-[#0F172A]">{mockPatientProfile.cancerType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: 'dailyReminders' as const, label: 'Daily Check-in Reminders', desc: 'Get reminded to check in with Ruby each day' },
              { key: 'educationUpdates' as const, label: 'Educational Content Updates', desc: 'New articles and resources for your symptoms' },
              { key: 'weeklySummary' as const, label: 'Weekly Summary Reports', desc: 'Receive a weekly summary of your check-ins' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{item.label}</p>
                  <p className="text-xs text-[#64748B]">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${notifications[item.key] ? 'bg-primary' : 'bg-[#E2E8F0]'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security & Logout */}
        <Card className="shadow-sm rounded-xl">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row">
            <Button variant="outline" className="flex-1">
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

