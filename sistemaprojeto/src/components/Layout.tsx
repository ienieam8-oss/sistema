import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile } = useAuth();
  const { isMobile } = useMobileResponsive();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile-optimized Header */}
          <header className="h-12 sm:h-14 md:h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm flex items-center px-2 sm:px-4 md:px-6 sticky top-0 z-50">
            <SidebarTrigger className="mr-2 md:mr-4 p-1.5 sm:p-2 hover:bg-accent rounded-md transition-colors" />
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-base md:text-xl font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Sistema de Gestão de Eventos</span>
                <span className="sm:hidden">EventPro</span>
              </h1>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-sm text-muted-foreground truncate max-w-40">
                Olá, {profile?.full_name || profile?.email}
              </div>
            </div>
          </header>

          {/* Main Content with mobile padding and safe areas */}
          <main className="flex-1 p-2 sm:p-4 md:p-6 bg-background overflow-auto pb-safe-area-inset-bottom">
            <div className="max-w-full overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}