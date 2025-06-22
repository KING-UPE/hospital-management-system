import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import AddPatientModal from "@/components/modals/add-patient-modal";
import AddAppointmentModal from "@/components/modals/add-appointment-modal";
import { 
  Users, 
  UserRound, 
  Calendar, 
  DollarSign, 
  Plus,
  UserPlus,
  BarChart,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  activeDoctors: number;
  todayAppointments: number;
  totalAppointments: number;
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: recentAppointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  if (!user) return null;

  // Role-based stats cards
  const getStatsCards = () => {
    const baseCards = [
      {
        title: "Today's Appointments",
        value: stats?.todayAppointments || 0,
        icon: Calendar,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        change: "23 pending",
        changeText: "need confirmation",
        roles: ["admin", "doctor", "receptionist", "patient"]
      },
      {
        title: "Total Appointments",
        value: stats?.totalAppointments || 0,
        icon: DollarSign,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        change: "+8%",
        changeText: "from last month",
        roles: ["admin", "doctor", "receptionist"]
      }
    ];

    // Admin and staff can see patient/doctor stats
    if (["admin", "doctor", "receptionist"].includes(user.role)) {
      baseCards.unshift(
        {
          title: "Total Patients",
          value: stats?.totalPatients || 0,
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          change: "+12%",
          changeText: "from last month",
          roles: ["admin", "doctor", "receptionist"]
        }
      );
    }

    // Only admin can see doctor management stats
    if (user.role === "admin") {
      baseCards.splice(1, 0, {
        title: "Active Doctors",
        value: stats?.activeDoctors || 0,
        icon: UserRound,
        color: "text-green-600",
        bgColor: "bg-green-50",
        change: "+5%",
        changeText: "from last month",
        roles: ["admin"]
      });
    }

    return baseCards.filter(card => card.roles.includes(user.role));
  };

  const statsCards = getStatsCards();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user.firstName}!
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold">
                            {isLoading ? "..." : stat.value}
                          </p>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {stat.change}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {stat.changeText}
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Appointments */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>Latest appointment bookings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/appointments")}>
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(recentAppointments) && recentAppointments.length > 0 ? (
                      recentAppointments.slice(0, 5).map((appointment: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                with {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{appointment.time}</p>
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'pending' ? 'secondary' :
                              'outline'
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No appointments yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Schedule your first appointment to get started with patient care.
                        </p>
                        <Button onClick={() => setShowAddAppointmentModal(true)} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowAddAppointmentModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Appointment
                  </Button>
                  {['admin', 'doctor', 'receptionist'].includes(user.role) && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setShowAddPatientModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Patient
                    </Button>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => window.location.href = '/doctors'}
                      >
                        <UserRound className="w-4 h-4 mr-2" />
                        Manage Doctors
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => window.location.href = '/reports'}
                      >
                        <BarChart className="w-4 h-4 mr-2" />
                        View Reports
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AddPatientModal 
        open={showAddPatientModal} 
        onOpenChange={setShowAddPatientModal}
      />
      <AddAppointmentModal 
        open={showAddAppointmentModal} 
        onOpenChange={setShowAddAppointmentModal}
      />
    </div>
  );
}
