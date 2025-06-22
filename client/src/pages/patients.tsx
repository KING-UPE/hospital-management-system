import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye, 
  Edit, 
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import AddPatientModal from "@/components/modals/add-patient-modal";
import ViewPatientModal from "@/components/modals/view-patient-modal";
import EditPatientModal from "@/components/modals/edit-patient-modal";
import AddAppointmentModal from "@/components/modals/add-appointment-modal";
import type { PatientWithUser } from "@shared/schema";

export default function PatientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showViewPatientModal, setShowViewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithUser | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !['admin', 'doctor', 'receptionist'].includes(user.role)) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const { data: patients, isLoading } = useQuery<PatientWithUser[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && ['admin', 'doctor', 'receptionist'].includes(user.role),
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients?.filter(patient => {
    const matchesSearch = 
      patient.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user.phone.includes(searchTerm);

    const age = calculateAge(patient.dateOfBirth);
    const matchesAge = !ageFilter || ageFilter === 'all' || 
      (ageFilter === "0-18" && age <= 18) ||
      (ageFilter === "19-35" && age >= 19 && age <= 35) ||
      (ageFilter === "36-60" && age >= 36 && age <= 60) ||
      (ageFilter === "60+" && age > 60);

    const matchesGender = !genderFilter || genderFilter === 'all' || patient.gender === genderFilter;

    return matchesSearch && matchesAge && matchesGender;
  }) || [];

  if (!user || !['admin', 'doctor', 'receptionist'].includes(user.role)) return null;

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
                  <Users className="w-6 h-6 mr-2" />
                  Patients
                </h1>
                <p className="text-muted-foreground">
                  Manage patient records and information
                </p>
              </div>
{/* Only Admin, Doctor, and Receptionist can add patients */}
              {['admin', 'doctor', 'receptionist'].includes(user.role) && (
                <Button onClick={() => setShowAddPatientModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={ageFilter} onValueChange={setAgeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Age Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="0-18">0-18 years</SelectItem>
                      <SelectItem value="19-35">19-35 years</SelectItem>
                      <SelectItem value="36-60">36-60 years</SelectItem>
                      <SelectItem value="60+">60+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setAgeFilter("all");
                    setGenderFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patients Grid */}
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
              ) : filteredPatients.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No patients found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || ageFilter || genderFilter ? 
                        "Try adjusting your search criteria." : 
                        "No patients are registered yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPatients.map((patient) => (
                  <Card key={patient.id} className="patient-card group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {patient.user.firstName} {patient.user.lastName}
                            </CardTitle>
                            <CardDescription>
                              ID: <code className="text-xs">{patient.id}</code>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {patient.gender}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <p className="font-medium">{calculateAge(patient.dateOfBirth)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">DOB:</span>
                          <p className="font-medium">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {patient.user.phone}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          {patient.user.email}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowViewPatientModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowScheduleModal(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                        {['admin', 'receptionist'].includes(user.role) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowEditPatientModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
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

      <AddPatientModal 
        open={showAddPatientModal} 
        onOpenChange={setShowAddPatientModal}
      />
      <ViewPatientModal 
        open={showViewPatientModal} 
        onOpenChange={setShowViewPatientModal}
        patient={selectedPatient}
      />
      <EditPatientModal 
        open={showEditPatientModal} 
        onOpenChange={setShowEditPatientModal}
        patient={selectedPatient}
      />
      <AddAppointmentModal 
        open={showScheduleModal} 
        onOpenChange={setShowScheduleModal}
      />
    </div>
  );
}
