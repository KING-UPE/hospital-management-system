import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserRound, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Calendar,
  User
} from "lucide-react";
import type { DoctorWithUser } from "@shared/schema";

interface ViewDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: DoctorWithUser | null;
}

export default function ViewDoctorModal({ open, onOpenChange, doctor }: ViewDoctorModalProps) {
  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserRound className="w-5 h-5 mr-2" />
            Doctor Details
          </DialogTitle>
          <DialogDescription>
            Complete information for Dr. {doctor.user.firstName} {doctor.user.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Doctor Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserRound className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    ID: <code className="text-sm bg-muted px-2 py-1 rounded">{doctor.id}</code>
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={doctor.user.status === 'active' ? 'default' : 'secondary'}>
                      {doctor.user.status}
                    </Badge>
                    <Badge variant="outline">
                      {doctor.specialization}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Contact details and basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm">{doctor.user.firstName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm">{doctor.user.lastName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.user.phone}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{doctor.user.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(doctor.user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={doctor.user.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                    {doctor.user.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Medical credentials and specialization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Specialization</label>
                  <Badge variant="outline" className="w-fit">
                    {doctor.specialization}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">License Number</label>
                  <p className="text-sm font-mono">{doctor.licenseNumber}</p>
                </div>
              </div>
              
              {doctor.experience !== null && doctor.experience > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Experience</label>
                  <p className="text-sm">{doctor.experience} years</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}