import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, BarChart3, FileText, Users, Download, Filter } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

interface ReportData {
  totalAppointments: number;
  appointmentsByStatus: Record<string, number>;
  appointmentsByDoctor: Record<string, number>;
  appointmentsByMonth: Record<string, number>;
  patientDemographics: {
    totalPatients: number;
    byGender: Record<string, number>;
    byAgeGroup: Record<string, number>;
  };
  doctorUtilization: Array<{
    doctorId: string;
    doctorName: string;
    totalAppointments: number;
    completedAppointments: number;
    utilizationRate: number;
  }>;
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("last30");
  const [reportType, setReportType] = useState("overview");
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !['admin', 'doctor'].includes(user.role)) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/reports', dateRange, reportType],
    enabled: !!user && ['admin', 'doctor'].includes(user.role),
  });

  const generateReport = () => {
    // Mock report generation
    const reportContent = `
Hospital Management System Report
Generated on: ${new Date().toLocaleDateString()}
Report Type: ${reportType}
Date Range: ${dateRange}

Summary:
- Total Appointments: ${reportData?.totalAppointments || 0}
- Total Patients: ${reportData?.patientDemographics?.totalPatients || 0}
- Active Doctors: ${Object.keys(reportData?.appointmentsByDoctor || {}).length}

Appointment Status Breakdown:
${Object.entries(reportData?.appointmentsByStatus || {}).map(([status, count]) => 
  `- ${status}: ${count}`
).join('\n')}

Patient Demographics:
- Male: ${reportData?.patientDemographics?.byGender?.male || 0}
- Female: ${reportData?.patientDemographics?.byGender?.female || 0}
- Other: ${reportData?.patientDemographics?.byGender?.other || 0}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospital-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user || !['admin', 'doctor'].includes(user.role)) return null;

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
                  <BarChart3 className="w-6 h-6 mr-2" />
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground">
                  View hospital statistics and generate reports
                </p>
              </div>
              <Button onClick={generateReport} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Report Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="appointments">Appointments</SelectItem>
                        <SelectItem value="patients">Patients</SelectItem>
                        <SelectItem value="doctors">Doctors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7">Last 7 days</SelectItem>
                        <SelectItem value="last30">Last 30 days</SelectItem>
                        <SelectItem value="last90">Last 90 days</SelectItem>
                        <SelectItem value="thisyear">This year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Date</label>
                    <Input type="date" placeholder="Select custom date" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData?.totalAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData?.patientDemographics?.totalPatients || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +5.2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(reportData?.appointmentsByDoctor || {}).length}</div>
                  <p className="text-xs text-muted-foreground">
                    No change
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">
                    +1.2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Breakdown</CardTitle>
                <CardDescription>
                  Current distribution of appointment statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(reportData?.appointmentsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{status}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Doctor Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Doctor Utilization</CardTitle>
                <CardDescription>
                  Performance metrics for each doctor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.doctorUtilization?.map((doctor) => (
                    <div key={doctor.doctorId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{doctor.doctorName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doctor.totalAppointments} total appointments
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={doctor.utilizationRate > 80 ? "default" : "secondary"}>
                          {doctor.utilizationRate}% utilization
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {doctor.completedAppointments} completed
                        </p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No utilization data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
                <CardDescription>
                  Breakdown of patient population
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Gender Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(reportData?.patientDemographics?.byGender || {}).map(([gender, count]) => (
                        <div key={gender} className="flex justify-between">
                          <span className="capitalize">{gender}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Age Groups</h4>
                    <div className="space-y-2">
                      {Object.entries(reportData?.patientDemographics?.byAgeGroup || {}).map(([ageGroup, count]) => (
                        <div key={ageGroup} className="flex justify-between">
                          <span>{ageGroup}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}