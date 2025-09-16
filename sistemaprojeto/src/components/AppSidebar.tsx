import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  Package,
  Calendar,
  DollarSign,
  Settings,
  User,
  LogOut,
  CalendarDays,
  ChevronDown
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { profile, signOut, isSecretaryOrAdmin } = useAuth();
  const { isMobile } = useMobileResponsive();

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, title: "Dashboard", path: "/dashboard" },
    ];

    if (isSecretaryOrAdmin) {
      baseItems.push(
        { icon: Users, title: "Funcionários", path: "/funcionarios" },
        { icon: Package, title: "Equipamentos", path: "/equipamentos" },
        { icon: CalendarDays, title: "Eventos", path: "/eventos" },
        { icon: Calendar, title: "Calendário", path: "/calendario" },
        { icon: DollarSign, title: "Financeiro", path: "/financeiro" }
      );
    }

    baseItems.push({ icon: Settings, title: "Configurações", path: "/configuracoes" });
    return baseItems;
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar variant="sidebar" className="bg-sidebar border-r">
      <SidebarHeader className="border-b border-sidebar-border p-3 sm:p-4 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EventPro
            </h2>
            <p className="text-xs sm:text-xs md:text-sm text-sidebar-foreground/70 truncate">
              Sistema de Gestão
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 mb-2">Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                    className="w-full"
                  >
                    <button
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) {
                          toggleSidebar();
                        }
                      }}
                      className={`
                        flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                        ${isActive(item.path) 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        }
                      `}
                    >
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive(item.path) ? 'text-sidebar-primary' : ''}`} />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 sm:p-4">
        <SidebarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex items-center space-x-3 w-full min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sidebar-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-sidebar-primary" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {profile?.full_name || profile?.email || 'Usuário'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {profile?.role === 'admin' ? 'Administrador' : 
                       profile?.role === 'secretary' ? 'Secretário' : 'Usuário'}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-sidebar-foreground/60 flex-shrink-0" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;