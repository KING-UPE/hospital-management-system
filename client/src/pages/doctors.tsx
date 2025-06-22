import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import AddDoctorModal from "@/components/modals/add-doctor-modal";
import EditDoctorModal from "@/components/modals/edit-doctor-modal";
import ViewDoctorModal from "@/components/modals/view-doctor-modal";
import { 
  UserRound, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Phone,
  Mail
} from "lucide-react";
import type { DoctorWithUser } from "@shared/schema";

export default function DoctorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const { data: doctors, isLoading } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/doctors"],
    enabled: !!user && user.role === 'admin',
  });

  const deleteMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      return apiRequest("DELETE", `/api/doctors/${doctorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      toast({
        title: "Doctor deleted",
        description: "Doctor has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete doctor",
        variant: "destructive",
      });
    },
  });

  const filteredDoctors = doctors?.filter(doctor =>
    doctor.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (doctorId: string) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      deleteMutation.mutate(doctorId);
    }
  };

  if (!user || user.role !== 'admin') return null;

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
                  <UserRound className="w-6 h-6 mr-2" />
                  Manage Doctors
                </h1>
                <p className="text-muted-foreground">
                  Add and manage doctor accounts
                </p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, ID, or specialization"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctors Grid */}
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
              ) : filteredDoctors.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <UserRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Try adjusting your search criteria." : "Get started by adding your first doctor."}
                    </p>
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Doctor
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserRound className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Dr. {doctor.user.firstName} {doctor.user.lastName}
                            </CardTitle>
                            <CardDescription>
                              ID: <code className="text-xs">{doctor.id}</code>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {doctor.user.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Badge variant="secondary">
                          {doctor.specialization}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {doctor.user.phone}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="w-4 h-4 mr-2" />
                          {doctor.user.email}
                        </div>
                        {(doctor.experience ?? 0) > 0 && (
                          <div className="text-muted-foreground">
                            {doctor.experience} years experience
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 pt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(doctor.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <AddDoctorModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
      <EditDoctorModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        doctor={selectedDoctor}
      />
      <ViewDoctorModal 
        open={showViewModal} 
        onOpenChange={setShowViewModal}
        doctor={selectedDoctor}
      />
    </div>
  );
}
