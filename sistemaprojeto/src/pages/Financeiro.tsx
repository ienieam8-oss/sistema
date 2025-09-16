import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  PieChart
} from "lucide-react";
import { ResponsiveWrapper, ResponsiveGrid, ResponsiveCard } from "@/components/ResponsiveWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Financeiro = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [dailies, setDailies] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receitaTotal: 0,
    custosFuncionarios: 0,
    custosFreelancers: 0,
    lucroLiquido: 0,
    margemLucro: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch employee dailies
      const { data: dailiesData, error: dailiesError } = await supabase
        .from('employee_dailies')
        .select(`
          *, 
          employees(name, type, fixed_salary), 
          events(client_name, event_date, event_location, total_cost)
        `)
        .order('service_date', { ascending: false });

      if (dailiesError) throw dailiesError;

      // Fetch employee payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('employee_payments')
        .select(`
          *, 
          employees(name, type)
        `)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      setEmployees(employeesData || []);
      setEvents(eventsData || []);
      setDailies(dailiesData || []);
      setPayments(paymentsData || []);

      calculateFinancialSummary(eventsData, dailiesData, paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros.",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialSummary = (eventsData: any[], dailiesData: any[], paymentsData: any[]) => {
    const receitaTotal = eventsData?.reduce((acc, event) => acc + (event.total_cost || 0), 0) || 0;
    const custosFuncionarios = paymentsData?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;
    const custosFreelancers = dailiesData?.filter(daily => daily.employees?.type === 'freelancer')
      .reduce((acc, daily) => acc + (daily.daily_value || 0) + (daily.additional_value || 0), 0) || 0;
    const lucroLiquido = receitaTotal - custosFuncionarios - custosFreelancers;
    const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    setResumoFinanceiro({
      receitaTotal,
      custosFuncionarios,
      custosFreelancers,
      lucroLiquido,
      margemLucro
    });
  };

  const getFixedEmployeesWithSalaries = () => {
    const fixedEmployees = employees.filter(emp => emp.type === 'fixed');
    return fixedEmployees.map(emp => {
      const employeePayments = payments.filter(payment => payment.employee_id === emp.id);
      const totalPaid = employeePayments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
      const additionalValues = dailies.filter(daily => daily.employee_id === emp.id)
        .reduce((acc, daily) => acc + (daily.additional_value || 0), 0);
      
      return {
        nome: emp.name,
        cargo: emp.position || 'Não especificado',
        salarioFixo: emp.fixed_salary || 0,
        adicional: additionalValues,
        totalPago: totalPaid,
        total: (emp.fixed_salary || 0) + additionalValues
      };
    });
  };

  const getFreelancerDailies = () => {
    return dailies.filter(daily => daily.employees?.type === 'freelancer').map(daily => ({
      nome: daily.employees?.name || 'Não especificado',
      valorDiaria: daily.daily_value || 0,
      evento: daily.events?.client_name || 'Sem evento',
      dias: 1, // Assuming 1 day per daily entry
      total: (daily.daily_value || 0) + (daily.additional_value || 0)
    }));
  };

  const getEventFinancials = () => {
    return events.map(event => {
      const eventDailies = dailies.filter(daily => daily.event_id === event.id);
      const custoFuncionarios = eventDailies.filter(daily => daily.employees?.type === 'fixed')
        .reduce((acc, daily) => acc + (daily.additional_value || 0), 0);
      const custoFreelancers = eventDailies.filter(daily => daily.employees?.type === 'freelancer')
        .reduce((acc, daily) => acc + (daily.daily_value || 0) + (daily.additional_value || 0), 0);
      const receita = event.total_cost || 0;
      const lucro = receita - custoFuncionarios - custoFreelancers;

      return {
        evento: event.client_name,
        receita,
        custoFuncionarios,
        custoFreelancers,
        lucro
      };
    });
  };

  if (loading) {
    return (
      <ResponsiveWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  const salariosFixos = getFixedEmployeesWithSalaries();
  const diariasFreelancers = getFreelancerDailies();
  const gastosEventos = getEventFinancials();

  return (
    <ResponsiveWrapper>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Financeiro</h2>
        <p className="text-muted-foreground">
          Métricas financeiras e controle de custos
        </p>
      </div>

      {/* Financial Overview */}
      <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4 }} className="mb-6">
        <ResponsiveCard padding="medium" className="hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-xl md:text-2xl font-bold text-success">
                R$ {resumoFinanceiro.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-success flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Eventos realizados
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard padding="medium" className="hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custos Funcionários</p>
              <p className="text-xl md:text-2xl font-bold text-warning">
                R$ {resumoFinanceiro.custosFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-warning flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Pagamentos realizados
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard padding="medium" className="hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Custos Freelancers</p>
              <p className="text-xl md:text-2xl font-bold text-primary">
                R$ {resumoFinanceiro.custosFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-primary flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Diárias pagas
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard padding="medium" className="hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
              <p className="text-xl md:text-2xl font-bold text-success">
                R$ {resumoFinanceiro.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-success">
                Margem: {resumoFinanceiro.margemLucro.toFixed(1)}%
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      {/* Detailed Financial Data */}
      <Tabs defaultValue="funcionarios" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="funcionarios" className="text-xs md:text-sm">Salários Fixos</TabsTrigger>
            <TabsTrigger value="freelancers" className="text-xs md:text-sm">Freelancers</TabsTrigger>
            <TabsTrigger value="eventos" className="text-xs md:text-sm">Por Evento</TabsTrigger>
          </TabsList>
        </div>

        {/* Salários Fixos */}
        <TabsContent value="funcionarios">
          <ResponsiveCard padding="medium">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Salários dos Funcionários Fixos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {salariosFixos.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum funcionário fixo encontrado</p>
                </div>
              ) : (
                <>
                  {salariosFixos.map((funcionario, index) => (
                    <ResponsiveCard key={index} padding="small" className="bg-muted/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{funcionario.nome}</h4>
                          <p className="text-sm text-muted-foreground truncate">{funcionario.cargo}</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm">
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Salário Fixo</p>
                            <p className="font-medium text-foreground">R$ {funcionario.salarioFixo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Adicional</p>
                            <p className="font-medium text-primary">R$ {funcionario.adicional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-success">R$ {funcionario.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    </ResponsiveCard>
                  ))}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Mensal</p>
                        <p className="text-xl md:text-2xl font-bold text-success">
                          R$ {salariosFixos.reduce((acc, f) => acc + f.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </ResponsiveCard>
        </TabsContent>

        {/* Diárias Freelancers */}
        <TabsContent value="freelancers">
          <ResponsiveCard padding="medium">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Pagamento de Freelancers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {diariasFreelancers.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma diária de freelancer encontrada</p>
                </div>
              ) : (
                <>
                  {diariasFreelancers.map((freelancer, index) => (
                    <ResponsiveCard key={index} padding="small" className="bg-muted/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{freelancer.nome}</h4>
                          <p className="text-sm text-muted-foreground truncate">{freelancer.evento}</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm">
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Valor/Dia</p>
                            <p className="font-medium text-foreground">R$ {freelancer.valorDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Dias</p>
                            <p className="font-medium text-primary">{freelancer.dias}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-bold text-success">R$ {freelancer.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    </ResponsiveCard>
                  ))}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Freelancers</p>
                        <p className="text-xl md:text-2xl font-bold text-success">
                          R$ {diariasFreelancers.reduce((acc, f) => acc + f.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </ResponsiveCard>
        </TabsContent>

        {/* Gastos por Evento */}
        <TabsContent value="eventos">
          <ResponsiveCard padding="medium">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Análise Financeira por Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gastosEventos.length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum evento encontrado</p>
                </div>
              ) : (
                <>
                  {gastosEventos.map((evento, index) => (
                    <ResponsiveCard key={index} padding="small" className="bg-muted/30">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground truncate flex-1 min-w-0">{evento.evento}</h4>
                        <Badge className="bg-success text-success-foreground mt-2 md:mt-0 self-start md:self-center">
                          Margem: {evento.receita > 0 ? ((evento.lucro / evento.receita) * 100).toFixed(1) : '0.0'}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Receita</p>
                          <p className="font-bold text-success">R$ {evento.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Funcionários</p>
                          <p className="font-medium text-warning">R$ {evento.custoFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Freelancers</p>
                          <p className="font-medium text-primary">R$ {evento.custoFreelancers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Lucro</p>
                          <p className="font-bold text-success">R$ {evento.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </ResponsiveCard>
                  ))}
                  <div className="border-t border-border pt-4">
                    <ResponsiveGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }}>
                      <div className="text-center">
                        <p className="text-muted-foreground">Receita Total</p>
                        <p className="text-xl md:text-2xl font-bold text-success">
                          R$ {gastosEventos.reduce((acc, e) => acc + e.receita, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Custos Funcionários</p>
                        <p className="text-lg md:text-xl font-bold text-warning">
                          R$ {gastosEventos.reduce((acc, e) => acc + e.custoFuncionarios, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Custos Freelancers</p>
                        <p className="text-lg md:text-xl font-bold text-primary">
                          R$ {gastosEventos.reduce((acc, e) => acc + e.custoFreelancers, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Lucro Total</p>
                        <p className="text-xl md:text-2xl font-bold text-success">
                          R$ {gastosEventos.reduce((acc, e) => acc + e.lucro, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </ResponsiveGrid>
                  </div>
                </>
              )}
            </CardContent>
          </ResponsiveCard>
        </TabsContent>
      </Tabs>
    </ResponsiveWrapper>
  );
};

export default Financeiro;