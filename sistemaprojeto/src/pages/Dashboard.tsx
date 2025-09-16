import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  CalendarDays, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalEmployees: number;
  fixedEmployees: number;
  freelancers: number;
  totalEquipment: number;
  availableEquipment: number;
  maintenanceEquipment: number;
  totalEvents: number;
  completedEvents: number;
  plannedEvents: number;
  monthlyRevenue: number;
  monthlyCosts: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    fixedEmployees: 0,
    freelancers: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    maintenanceEquipment: 0,
    totalEvents: 0,
    completedEvents: 0,
    plannedEvents: 0,
    monthlyRevenue: 0,
    monthlyCosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch employees stats
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('type, fixed_salary, daily_rate');

      if (employeesError) throw employeesError;

      // Fetch equipment stats  
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('total_quantity, available_quantity, maintenance_quantity');

      if (equipmentError) throw equipmentError;

      // Fetch events stats
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('status, total_cost');

      if (eventsError) throw eventsError;

      // Calculate stats
      const fixedEmployees = employees?.filter(emp => emp.type === 'fixed').length || 0;
      const freelancers = employees?.filter(emp => emp.type === 'freelancer').length || 0;
      
      const totalEquipmentCount = equipment?.reduce((sum, eq) => sum + (eq.total_quantity || 0), 0) || 0;
      const availableEquipmentCount = equipment?.reduce((sum, eq) => sum + (eq.available_quantity || 0), 0) || 0;
      const maintenanceEquipmentCount = equipment?.reduce((sum, eq) => sum + (eq.maintenance_quantity || 0), 0) || 0;

      const completedEventsCount = events?.filter(event => event.status === 'completed').length || 0;
      const plannedEventsCount = events?.filter(event => event.status === 'planned').length || 0;

      const monthlyRevenue = events?.filter(event => event.status === 'completed')
        .reduce((sum, event) => sum + (event.total_cost || 0), 0) || 0;

      const monthlyCosts = employees?.reduce((sum, emp) => {
        if (emp.type === 'fixed') {
          return sum + (emp.fixed_salary || 0);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalEmployees: employees?.length || 0,
        fixedEmployees,
        freelancers,
        totalEquipment: totalEquipmentCount,
        availableEquipment: availableEquipmentCount,
        maintenanceEquipment: maintenanceEquipmentCount,
        totalEvents: events?.length || 0,
        completedEvents: completedEventsCount,
        plannedEvents: plannedEventsCount,
        monthlyRevenue,
        monthlyCosts,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do dashboard.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
      <div className="px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          Visão geral do sistema de gestão de eventos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground">Total de Funcionários</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {stats.fixedEmployees} fixos • {stats.freelancers} freelancers
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground">Equipamentos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stats.totalEquipment}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {stats.availableEquipment} disponíveis • {stats.maintenanceEquipment} manutenção
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground">Eventos</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {stats.completedEvents} concluídos • {stats.plannedEvents} planejados
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-success">
                  R$ {stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Lucro: R$ {(stats.monthlyRevenue - stats.monthlyCosts).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center text-sm sm:text-base md:text-lg">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <span className="text-xs sm:text-xs md:text-sm font-medium">Taxa de Utilização de Equipamentos</span>
              <span className="text-xs sm:text-xs md:text-sm font-bold text-primary">
                {stats.totalEquipment > 0 
                  ? Math.round(((stats.totalEquipment - stats.availableEquipment) / stats.totalEquipment) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
              <span className="text-xs sm:text-xs md:text-sm font-medium">Margem de Lucro</span>
              <span className="text-xs sm:text-xs md:text-sm font-bold text-success">
                {stats.monthlyRevenue > 0 
                  ? Math.round(((stats.monthlyRevenue - stats.monthlyCosts) / stats.monthlyRevenue) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center text-sm sm:text-base md:text-lg">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
            {stats.maintenanceEquipment > 0 && (
              <div className="flex items-center p-2 sm:p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-xs md:text-sm">
                  {stats.maintenanceEquipment} equipamento(s) em manutenção
                </span>
              </div>
            )}
            {stats.plannedEvents > 0 && (
              <div className="flex items-center p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-xs md:text-sm">
                  {stats.plannedEvents} evento(s) planejado(s)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;