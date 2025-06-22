import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import ScheduleAppointmentModal from "@/components/modals/schedule-appointment-modal";
import ViewAppointmentModal from "@/components/modals/view-appointment-modal";
import EditAppointmentModal from "@/components/modals/edit-appointment-modal";
import { 
  Calendar, 
  CalendarPlus, 
  Search, 
  Eye, 
  Edit, 
  X,
  Clock,
  User,
  UserRound,
  Stethoscope
} from "lucide-react";
import type { AppointmentWithDetails } from "@shared/schema";

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  const { data: appointments, isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: !!user && ['admin', 'receptionist'].includes(user.role),
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status: "cancelled"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment cancelled",
        description: "Appointment has been successfully cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    },
  });

  const handleCancel = (appointment: AppointmentWithDetails) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      cancelMutation.mutate(appointment.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'in-progress': return 'destructive';
      case 'completed': return 'outline';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = 
      appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || appointment.date === dateFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' || appointment.status === statusFilter;
    const matchesDoctor = !doctorFilter || doctorFilter === 'all' || appointment.doctorId === doctorFilter;

    return matchesSearch && matchesDate && matchesStatus && matchesDoctor;
  }) || [];

  if (!user) return null;

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
                <h1 className="text-2xl font-bold flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Appointments
                </h1>
                <p className="text-muted-foreground">
                  Manage and schedule appointments
                </p>
              </div>
              <Button onClick={() => setShowScheduleModal(true)}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {Array.isArray(doctors) && doctors.length > 0 && (
                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Doctors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.user.firstName} {doctor.user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setDateFilter("");
                    setStatusFilter("all");
                    setDoctorFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAppointments.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || dateFilter || statusFilter || doctorFilter ? 
                        "Try adjusting your search criteria." : 
                        "No appointments scheduled yet."
                      }
                    </p>
                    <Button onClick={() => setShowScheduleModal(true)}>
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="appointment-card group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">
                              {appointment.time}
                            </CardTitle>
                            <CardDescription>
                              {new Date(appointment.date).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{appointment.patient.firstName} {appointment.patient.lastName}</span>
                          <span className="text-muted-foreground ml-1">
                            ({appointment.patientId})
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <UserRound className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Stethoscope className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{appointment.doctor.doctorInfo.specialization}</span>
                        </div>
                      </div>
                      
                      {appointment.reason && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {appointment.reason}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {['admin', 'receptionist', 'doctor'].includes(user.role) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {['admin', 'receptionist'].includes(user.role) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(appointment)}
                            disabled={cancelMutation.isPending || appointment.status === 'cancelled'}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <ScheduleAppointmentModal 
        open={showScheduleModal} 
        onOpenChange={setShowScheduleModal}
      />
      
      <ViewAppointmentModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        appointment={selectedAppointment}
      />
      
      <EditAppointmentModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        appointment={selectedAppointment}
      />
    </div>
  );
}
