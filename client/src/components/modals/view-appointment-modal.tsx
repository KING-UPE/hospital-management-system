import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  UserRound, 
  Stethoscope,
  FileText,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import type { AppointmentWithDetails } from "@shared/schema";

interface ViewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithDetails | null;
}

export default function ViewAppointmentModal({ open, onOpenChange, appointment }: ViewAppointmentModalProps) {
  if (!appointment) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            Complete information for appointment #{appointment.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appointment Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{appointment.time}</h3>
                    <p className="text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-sm">{appointment.duration || 30} minutes</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm capitalize">{appointment.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Patient ID: {appointment.patientId}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.patient.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.patient.phone}</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{appointment.patient.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserRound className="w-5 h-5 mr-2" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">
                    Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Doctor ID: {appointment.doctorId}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.doctor.doctorInfo.specialization}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{appointment.doctor.email}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{appointment.doctor.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          {appointment.reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Reason for Visit</label>
                  <p className="text-sm">{appointment.reason}</p>
                </div>
                
                {appointment.notes && (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}