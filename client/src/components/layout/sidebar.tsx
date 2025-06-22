import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { 
  Hospital, 
  LayoutDashboard, 
  UserRound, 
  Stethoscope, 
  Users, 
  Calendar, 
  User, 
  BarChart, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "patient"] },
    { path: "/doctors", label: "Manage Doctors", icon: UserRound, roles: ["admin"] },
    { path: "/specializations", label: "Specializations", icon: Stethoscope, roles: ["admin"] },
    { path: "/reports", label: "Reports", icon: BarChart, roles: ["admin"] },
    { path: "/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
    { path: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "patient"] },
    { path: "/profile", label: "Profile", icon: User, roles: ["admin", "doctor", "receptionist", "patient"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={`
      fixed lg:relative z-50 w-64 h-screen bg-sidebar text-sidebar-foreground
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-sidebar-accent rounded-full flex items-center justify-center">
            <Hospital className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">HMS</h2>
          {user && (
            <div className="space-y-1">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <Badge variant="secondary" className="text-xs">
                {user.role.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`
                    w-full justify-start text-left h-11
                    ${isActive(item.path) 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                  onClick={onClose}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-6 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
