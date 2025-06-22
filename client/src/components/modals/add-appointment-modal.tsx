import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { InsertAppointment, DoctorWithUser, PatientWithUser } from "@shared/schema";

interface AddAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function apiRequest(method: string, url: string, data?: any) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

export default function AddAppointmentModal({ open, onOpenChange }: AddAppointmentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InsertAppointment>>({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    duration: 30,
    reason: "",
    type: "consultation",
    notes: "",
  });

  const { data: doctors } = useQuery<DoctorWithUser[]>({
    queryKey: ["/api/doctors"],
    enabled: open && ['admin', 'doctor', 'receptionist'].includes(user?.role || ''),
  });

  const { data: patients } = useQuery<PatientWithUser[]>({
    queryKey: ["/api/patients"],
    enabled: open && ['admin', 'doctor', 'receptionist'].includes(user?.role || ''),
  });

  const updateFormData = (field: keyof InsertAppointment, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      return apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      setFormData({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        duration: 30,
        reason: "",
        type: "consultation",
        notes: "",
      });
      toast({
        title: "Appointment scheduled",
        description: "New appointment has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.patientId || !formData.doctorId || !formData.date || 
        !formData.time || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate(formData as InsertAppointment);
  };

  // For patients, auto-select their own ID
  const availablePatients = user?.role === 'patient' 
    ? patients?.filter(p => p.id === user.id.replace('PAT', 'PAT')) 
    : patients;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment in the hospital system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {user?.role !== 'patient' && (
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select value={formData.patientId} onValueChange={(value) => updateFormData("patientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {availablePatients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.user.firstName} {patient.user.lastName} ({patient.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor *</Label>
            <Select value={formData.doctorId} onValueChange={(value) => updateFormData("doctorId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors?.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData("date", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => updateFormData("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration?.toString()} onValueChange={(value) => updateFormData("duration", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => updateFormData("reason", e.target.value)}
              rows={2}
              placeholder="Brief description of the reason for the appointment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              rows={2}
              placeholder="Any additional notes or special requirements"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}