import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { 
  Calendar,
  Clock,
  Package,
  MapPin,
  User,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const CalendarioLogs = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', startOfMonth(currentMonth).toISOString())
        .lte('event_date', endOfMonth(currentMonth).toISOString())
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Load equipment for maintenance info
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*');

      if (equipmentError) throw equipmentError;

      setEvents(eventsData || []);
      setEquipment(equipmentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create logs from events for demonstration
  const logs = events.map((event, index) => ({
    id: event.id,
    data: event.setup_date || event.event_date,
    hora: "08:00",
    tipo: "evento",
    acao: event.status === "planned" ? "Evento planejado" : "Evento em andamento",
    evento: `Evento para ${event.client_name}`,
    local: event.event_location,
    usuario: "Sistema"
  }));

  // Filter events for selected date
  const filteredEvents = events.filter(event => {
    if (!selectedDate) return true;
    const eventDate = new Date(event.event_date);
    const setupDate = event.setup_date ? new Date(event.setup_date) : null;
    
    return (
      format(eventDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ||
      (setupDate && format(setupDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-primary text-primary-foreground";
      case "in_progress":
        return "bg-warning text-warning-foreground";
      case "completed":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned":
        return "Planejado";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "evento":
        return Calendar;
      case "equipamento":
        return Package;
      case "manutencao":
        return Package;
      case "locacao":
        return Package;
      default:
        return Clock;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "evento":
        return "text-primary";
      case "equipamento":
        return "text-success";
      case "manutencao":
        return "text-warning";
      case "locacao":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Calendário de Eventos</h2>
          <p className="text-muted-foreground">
            Visualização e histórico de eventos por data
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Calendar and Month Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={ptBR}
                className="w-full"
                modifiers={{
                  eventDay: events.map(event => new Date(event.event_date))
                }}
                modifiersStyles={{
                  eventDay: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '0.375rem'
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eventos Este Mês</p>
                    <p className="text-xl font-bold text-foreground">
                      {events.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Em Manutenção</p>
                    <p className="text-xl font-bold text-foreground">
                      {equipment.filter(e => e.maintenance_quantity > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {selectedDate ? 
                  `Eventos para ${format(selectedDate, 'dd/MM/yyyy')}` : 
                  'Todos os Eventos do Mês'
                }
              </div>
              {selectedDate && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDate(undefined)}
                >
                  Ver Todos
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(selectedDate ? filteredEvents : events).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {selectedDate ? 
                        'Nenhum evento encontrado para esta data.' : 
                        'Nenhum evento encontrado para este mês.'
                      }
                    </p>
                  </div>
                ) : (
                  (selectedDate ? filteredEvents : events).map((event) => (
                    <div key={event.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              Evento para {event.client_name}
                            </h4>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {event.client_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {getStatusText(event.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.event_location}
                        </p>
                        {event.setup_date && (
                          <p className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Montagem: {format(new Date(event.setup_date), 'dd/MM/yyyy')}
                          </p>
                        )}
                        <p className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Evento: {format(new Date(event.event_date), 'dd/MM/yyyy')}
                        </p>
                        {event.total_cost && (
                          <p className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            Custo: R$ {Number(event.total_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                        {event.notes && (
                          <p className="text-xs mt-2 p-2 bg-muted/50 rounded">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarioLogs;