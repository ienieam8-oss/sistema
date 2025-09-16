import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Calendar, 
  MapPin,
  User,
  FileDown,
  Edit,
  Search,
  Clock,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const Eventos = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    client_name: "",
    event_location: "",
    setup_date: "",
    setup_time: "",
    event_date: "",
    total_cost: "",
    notes: "",
    equipment_items: [] as Array<{equipment_id: string, quantity: number}>
  });
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsResult, equipmentResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false }),
        supabase
          .from('equipment')
          .select('*')
          .order('name')
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (equipmentResult.error) throw equipmentResult.error;
      
      setEvents(eventsResult.data || []);
      setEquipment(equipmentResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (!newEvent.client_name || !newEvent.event_location || !newEvent.setup_date || !newEvent.setup_time) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Cliente, local, data de montagem e hora de montagem são obrigatórios.",
      });
      return;
    }

    try {
      const eventData = {
        client_name: newEvent.client_name,
        event_location: newEvent.event_location,
        setup_date: newEvent.setup_date,
        setup_time: newEvent.setup_time,
        event_date: newEvent.event_date || null,
        total_cost: newEvent.total_cost ? parseFloat(newEvent.total_cost) : 0,
        notes: newEvent.notes || null,
        status: 'planned'
      };

      const { data: eventResult, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .maybeSingle();

      if (error) throw error;

      // Insert equipment items
      if (newEvent.equipment_items.length > 0) {
        const equipmentItems = newEvent.equipment_items.map(item => ({
          event_id: eventResult.id,
          equipment_id: item.equipment_id,
          quantity: item.quantity
        }));

        const { error: equipmentError } = await supabase
          .from('event_equipment_items')
          .insert(equipmentItems);

        if (equipmentError) throw equipmentError;
      }

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso.",
      });

      resetForm();
      setShowAddDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar evento.",
      });
    }
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      // Delete event equipment items first
      await supabase
        .from('event_equipment_items')
        .delete()
        .eq('event_id', eventToDelete.id);

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso.",
      });

      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir evento.",
      });
    }
  };
  const updateEvent = async () => {
    if (!selectedEvent || !selectedEvent.client_name || !selectedEvent.event_location || !selectedEvent.setup_date || !selectedEvent.setup_time) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Cliente, local, data de montagem e hora de montagem são obrigatórios.",
      });
      return;
    }

    try {
      const eventData = {
        client_name: selectedEvent.client_name,
        event_location: selectedEvent.event_location,
        setup_date: selectedEvent.setup_date,
        setup_time: selectedEvent.setup_time,
        event_date: selectedEvent.event_date || null,
        total_cost: selectedEvent.total_cost ? parseFloat(selectedEvent.total_cost) : 0,
        notes: selectedEvent.notes || null,
        status: selectedEvent.status
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso.",
      });

      setShowEditDialog(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar evento.",
      });
    }
  };

  const resetForm = () => {
    setNewEvent({
      client_name: "",
      event_location: "",
      setup_date: "",
      setup_time: "",
      event_date: "",
      total_cost: "",
      notes: "",
      equipment_items: []
    });
  };

  const generatePDF = async (event: any) => {
    try {
      // Fetch event equipment
      const { data: equipmentItems } = await supabase
        .from('event_equipment_items')
        .select(`
          quantity,
          equipment:equipment_id (
            name,
            category
          )
        `)
        .eq('event_id', event.id);

      const pdf = new jsPDF();
      
      // Header with company branding
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('dB COMPANY', 20, 20);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('SOM/LUZ/VÍDEO', 20, 28);
      
      // Event details
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      let yPosition = 45;
      
      pdf.text(`São Paulo, ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 8;
      pdf.text('REF.: Orçamento para realização de evento.', 20, yPosition);
      yPosition += 6;
      pdf.text(`Cliente: ${event.client_name} - Local: ${event.event_location}`, 20, yPosition);
      yPosition += 6;
      
      if (event.setup_date && event.event_date) {
        pdf.text(`Montagem: ${new Date(event.setup_date).toLocaleDateString('pt-BR')} - Evento: ${new Date(event.event_date).toLocaleDateString('pt-BR')}`, 20, yPosition);
      } else if (event.event_date) {
        pdf.text(`Data do Evento: ${new Date(event.event_date).toLocaleDateString('pt-BR')}`, 20, yPosition);
      }
      yPosition += 15;

      // Equipment by category
      if (equipmentItems && equipmentItems.length > 0) {
        const categories = ['Som', 'Vídeo', 'Luz', 'Outros'];
        
        categories.forEach(category => {
          const categoryItems = equipmentItems.filter((item: any) => {
            const itemCategory = item.equipment?.category?.toLowerCase();
            return itemCategory === category.toLowerCase();
          });

          if (categoryItems.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${category.toUpperCase()} ${category === 'Som' ? 'TEATRO' : category === 'Video' ? 'PPT TEATRO' : 'TEATRO'}`, 20, yPosition);
            yPosition += 8;
            
            pdf.setFont('helvetica', 'normal');
            categoryItems.forEach((item: any) => {
              const quantity = item.quantity.toString().padStart(2, '0');
              pdf.text(`- ${quantity} ${item.equipment?.name || 'Equipamento'}`, 20, yPosition);
              yPosition += 6;
            });
            yPosition += 5;
          }
        });
      }

      // Cost information (only show for admin)
      if (isAdmin && event.total_cost && event.total_cost > 0) {
        yPosition += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Valor Total: R$ ${Number(event.total_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Notes
      if (event.notes) {
        yPosition += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Observações:', 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        const splitNotes = pdf.splitTextToSize(event.notes, 170);
        pdf.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 6;
      }
      
      // Footer
      yPosition = Math.max(yPosition + 20, 270);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Rua Bartolomeu Paes, 715 - São Paulo - SP - Cep: 05092-000', 20, yPosition);
      yPosition += 6;
      pdf.text('Tel: (11) 2235-2140 - Emerson: (11) 99406-5405 - Manuela (11) 994979023', 20, yPosition);
      yPosition += 6;
      pdf.text('E-mail: contato@dbcompany.com.br - www.instagram.com/br/dbcompany', 20, yPosition);
      
      // Save PDF
      pdf.save(`evento-${event.client_name.replace(/\s+/g, '-').toLowerCase()}-${event.id}.pdf`);
      
      toast({
        title: "PDF Gerado",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao gerar PDF.",
      });
    }
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    event.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4 md:space-y-6 bg-background">
      {/* Mobile-optimized Page Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Eventos</h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Gestão completa de eventos
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)} 
          className="bg-primary w-full sm:w-auto min-h-[44px] shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm">Criar Evento</span>
        </Button>
      </div>

      {/* Mobile-optimized Search */}
      <Card className="shadow-card bg-card">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile-optimized Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="shadow-card hover:shadow-elegant transition-all duration-300 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-lg leading-tight mb-2 pr-2">
                    {event.client_name}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.event_location}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(event.status)} text-xs px-2 py-1 whitespace-nowrap`}>
                  {getStatusText(event.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                {event.setup_date && (
                  <div className="flex items-center text-xs md:text-sm">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>Montagem: {new Date(event.setup_date).toLocaleDateString('pt-BR')}</span>
                    {event.setup_time && <span className="ml-1 md:ml-2">às {event.setup_time}</span>}
                  </div>
                )}
                {event.event_date && (
                  <div className="flex items-center text-xs md:text-sm">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>Evento: {new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {event.total_cost > 0 && (
                <div className="py-2">
                  <p className="text-base md:text-lg font-bold text-success">
                    R$ {Number(event.total_cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Valor orçado</p>
                </div>
              )}

              {/* Mobile-first action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none min-h-[40px] text-xs md:text-sm"
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline" 
                  className="flex-1 sm:flex-none min-h-[40px] text-xs md:text-sm"
                  onClick={() => generatePDF(event)}
                >
                  <FileDown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 sm:flex-none min-h-[40px] text-xs md:text-sm"
                  onClick={() => {
                    setEventToDelete(event);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Excluir
                </Button>
              </div>

              {event.notes && (
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Observações:</p>
                  <p className="text-xs md:text-sm text-foreground leading-relaxed">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredEvents.length === 0 && (
        <Card className="shadow-card bg-card">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? 
                'Tente ajustar a busca ou criar um novo evento.' :
                'Crie seu primeiro evento para começar.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-2xl max-h-[90vh] bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Criar Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name" className="text-sm font-medium">Cliente *</Label>
                <Input 
                  id="client_name" 
                  placeholder="Nome do cliente"
                  className="h-11"
                  value={newEvent.client_name}
                  onChange={(e) => setNewEvent({...newEvent, client_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_location" className="text-sm font-medium">Local do Evento *</Label>
                <Input 
                  id="event_location" 
                  placeholder="Endereço ou nome do local"
                  className="h-11"
                  value={newEvent.event_location}
                  onChange={(e) => setNewEvent({...newEvent, event_location: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="setup_date" className="text-sm font-medium">Data de Montagem *</Label>
                <Input 
                  id="setup_date" 
                  type="date"
                  className="h-11"
                  value={newEvent.setup_date}
                  onChange={(e) => setNewEvent({...newEvent, setup_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup_time" className="text-sm font-medium">Hora de Montagem *</Label>
                <Input 
                  id="setup_time" 
                  type="time"
                  className="h-11"
                  value={newEvent.setup_time}
                  onChange={(e) => setNewEvent({...newEvent, setup_time: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Data do Evento</Label>
              <Input 
                id="event_date" 
                type="date" 
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="total_cost">Valor Orçado</Label>
                <Input 
                  id="total_cost" 
                  type="number" 
                  step="0.01"
                  placeholder="25000.00" 
                  value={newEvent.total_cost}
                  onChange={(e) => setNewEvent({...newEvent, total_cost: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipamentos</Label>
              <Select onValueChange={(value) => {
                const existingItem = newEvent.equipment_items.find(item => item.equipment_id === value);
                if (!existingItem) {
                  setNewEvent({
                    ...newEvent,
                    equipment_items: [...newEvent.equipment_items, { equipment_id: value, quantity: 1 }]
                  });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar equipamentos..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment
                    .filter(eq => !newEvent.equipment_items.some(item => item.equipment_id === eq.id))
                    .map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} - {eq.category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {newEvent.equipment_items.length > 0 && (
                <div className="space-y-2 mt-2">
                  {newEvent.equipment_items.map((item) => {
                    const eq = equipment.find(e => e.id === item.equipment_id);
                    return eq ? (
                      <div key={item.equipment_id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1 text-sm">{eq.name} - {eq.category}</span>
                        <span className="text-xs text-muted-foreground">Max: {eq.total_quantity}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewEvent({
                                ...newEvent,
                                equipment_items: newEvent.equipment_items.map(i => 
                                  i.equipment_id === item.equipment_id 
                                    ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                    : i
                                )
                              })
                            }}
                          >
                            -
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const eq = equipment.find(e => e.id === item.equipment_id);
                              const maxQuantity = eq?.total_quantity || 1;
                              setNewEvent({
                                ...newEvent,
                                equipment_items: newEvent.equipment_items.map(i => 
                                  i.equipment_id === item.equipment_id 
                                    ? { ...i, quantity: Math.min(maxQuantity, i.quantity + 1) }
                                    : i
                                )
                              })
                            }}
                          >
                            +
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setNewEvent({
                                ...newEvent,
                                equipment_items: newEvent.equipment_items.filter(i => i.equipment_id !== item.equipment_id)
                              })
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre o evento..."
                rows={3}
                value={newEvent.notes}
                onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="min-h-[44px]">
                Cancelar
              </Button>
              <Button onClick={addEvent} className="min-h-[44px]">
                Criar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[95vw] md:max-w-2xl max-h-[90vh] bg-card">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl">Editar Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_client_name">Cliente *</Label>
                  <Input 
                    id="edit_client_name" 
                    placeholder="Nome do cliente" 
                    value={selectedEvent.client_name}
                    onChange={(e) => setSelectedEvent({...selectedEvent, client_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_event_location">Local do Evento *</Label>
                  <Input 
                    id="edit_event_location" 
                    placeholder="Endereço ou nome do local" 
                    value={selectedEvent.event_location}
                    onChange={(e) => setSelectedEvent({...selectedEvent, event_location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_setup_date">Data de Montagem *</Label>
                  <Input 
                    id="edit_setup_date" 
                    type="date" 
                    value={selectedEvent.setup_date || ''}
                    onChange={(e) => setSelectedEvent({...selectedEvent, setup_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_setup_time">Hora de Montagem *</Label>
                  <Input 
                    id="edit_setup_time" 
                    type="time" 
                    value={selectedEvent.setup_time || ''}
                    onChange={(e) => setSelectedEvent({...selectedEvent, setup_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_event_date">Data do Evento</Label>
                <Input 
                  id="edit_event_date" 
                  type="date" 
                  value={selectedEvent.event_date || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, event_date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="edit_total_cost">Valor Orçado</Label>
                    <Input 
                      id="edit_total_cost" 
                      type="number" 
                      step="0.01"
                      placeholder="25000.00" 
                      value={selectedEvent.total_cost || ''}
                      onChange={(e) => setSelectedEvent({...selectedEvent, total_cost: e.target.value})}
                    />
                  </div>
                )}
                <div className={`space-y-2 ${!isAdmin ? 'col-span-2' : ''}`}>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select 
                    value={selectedEvent.status} 
                    onValueChange={(value) => setSelectedEvent({...selectedEvent, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planejado</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_notes">Observações</Label>
                <Textarea
                  id="edit_notes"
                  placeholder="Informações adicionais sobre o evento..."
                  rows={3}
                  value={selectedEvent.notes || ''}
                  onChange={(e) => setSelectedEvent({...selectedEvent, notes: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => generatePDF(selectedEvent)} className="min-h-[44px]">
                  <FileDown className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="min-h-[44px]">
                  Cancelar
                </Button>
                <Button onClick={updateEvent} className="min-h-[44px]">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento para "{eventToDelete?.client_name}"? 
              Esta ação não pode ser desfeita e todos os equipamentos associados ao evento também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEvent} className="bg-destructive hover:bg-destructive/90">
              Excluir Evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Eventos;