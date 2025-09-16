import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveWrapper, ResponsiveGrid, ResponsiveCard } from "@/components/ResponsiveWrapper";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Package, 
  Edit,
  Weight,
  Ruler,
  Filter,
  Settings,
  Search,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Equipamentos = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [equipmentUnits, setEquipmentUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [editedUnits, setEditedUnits] = useState<any[]>([]);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    category: "",
    dimensions: "",
    weight: "",
    total_quantity: 1
  });

  const equipmentCategories = [
    "Som",
    "Iluminação", 
    "Vídeo",
    "Estrutura",
    "Decoração",
    "Outros"
  ];

  const categoryFilters = [
    { value: "all", label: "Todas as categorias" },
    { value: "Som", label: "Som" },
    { value: "Vídeo", label: "Vídeo" },
    { value: "Iluminação", label: "Luz" }
  ];

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddUnitDialog, setShowAddUnitDialog] = useState(false);
  const [selectedEquipmentForUnit, setSelectedEquipmentForUnit] = useState<any>(null);
  const [showDeleteUnitDialog, setShowDeleteUnitDialog] = useState(false);
  const [showDeleteEquipmentDialog, setShowDeleteEquipmentDialog] = useState(false);
  const [deleteUnitData, setDeleteUnitData] = useState<{unitId: string, unitIdentifier: string, equipmentId: string} | null>(null);
  const [deleteEquipmentData, setDeleteEquipmentData] = useState<{equipmentId: string, equipmentName: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch equipment with units
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (equipmentError) throw equipmentError;

      // Fetch equipment units
      const { data: unitsData, error: unitsError } = await supabase
        .from('equipment_units')
        .select('*')
        .order('unit_identifier');

      if (unitsError) throw unitsError;

      setEquipment(equipmentData || []);
      setEquipmentUnits(unitsData || []);
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

  const addEquipment = async () => {
    if (!newEquipment.name || !newEquipment.category || !newEquipment.dimensions || !newEquipment.weight) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome, categoria, dimensões e peso são obrigatórios.",
      });
      return;
    }

    try {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .insert([{
          name: newEquipment.name,
          category: newEquipment.category,
          dimensions: newEquipment.dimensions,
          weight: parseFloat(newEquipment.weight),
          total_quantity: newEquipment.total_quantity,
          available_quantity: newEquipment.total_quantity,
          maintenance_quantity: 0,
          unavailable_quantity: 0
        }])
        .select()
        .maybeSingle();

      if (equipmentError) throw equipmentError;

      // Create equipment units
      const units = [];
      for (let i = 1; i <= newEquipment.total_quantity; i++) {
        units.push({
          equipment_id: equipmentData.id,
          unit_identifier: `${newEquipment.name} #${i}`,
          status: 'available'
        });
      }

      const { error: unitsError } = await supabase
        .from('equipment_units')
        .insert(units);

      if (unitsError) throw unitsError;

      toast({
        title: "Sucesso",
        description: "Equipamento adicionado com sucesso.",
      });

      setNewEquipment({
        name: "",
        category: "",
        dimensions: "",
        weight: "",
        total_quantity: 1
      });
      setShowAddDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar equipamento.",
      });
    }
  };

  const updateUnitStatus = async (unitId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('equipment_units')
        .update({ status })
        .eq('id', unitId);

      if (error) throw error;

      // Update equipment quantities
      await updateEquipmentQuantities();
      
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status.",
      });
    }
  };

  const updateUnitIdentifier = async (unitId: string, identifier: string) => {
    try {
      const { error } = await supabase
        .from('equipment_units')
        .update({ unit_identifier: identifier })
        .eq('id', unitId);

      if (error) throw error;

      toast({
        title: "Sucesso", 
        description: "Identificador atualizado com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating identifier:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar identificador.",
      });
    }
  };

  const updateEquipmentQuantities = async () => {
    // This would update the available, maintenance, and unavailable quantities
    // based on the current status of all units
    for (const eq of equipment) {
      const units = equipmentUnits.filter(unit => unit.equipment_id === eq.id);
      const available = units.filter(unit => unit.status === 'available').length;
      const maintenance = units.filter(unit => unit.status === 'maintenance').length;
      const unavailable = units.filter(unit => 
        ['em_evento', 'locacao'].includes(unit.status)
      ).length;

      await supabase
        .from('equipment')
        .update({
          available_quantity: available,
          maintenance_quantity: maintenance,
          unavailable_quantity: unavailable
        })
        .eq('id', eq.id);
    }
  };

  const deleteUnit = async (unitId: string, unitIdentifier: string, equipmentId: string) => {
    // Verificar se a unidade está em uso
    const unit = equipmentUnits.find(u => u.id === unitId);
    
    if (!unit) return;
    
    if (['em_evento', 'locacao'].includes(unit.status)) {
      toast({
        variant: "destructive",
        title: "Não é possível excluir",
        description: `Esta unidade está em uso (${getStatusText(unit.status)}).`,
      });
      return;
    }

    setDeleteUnitData({ unitId, unitIdentifier, equipmentId });
    setShowDeleteUnitDialog(true);
  };

  const handleConfirmDeleteUnit = async () => {
    if (!deleteUnitData) return;
    
    const { unitId, unitIdentifier, equipmentId } = deleteUnitData;

    try {
      // Excluir a unidade
      const { error: unitError } = await supabase
        .from('equipment_units')
        .delete()
        .eq('id', unitId);

      if (unitError) throw unitError;

      // Verificar se ainda existem outras unidades para este equipamento
      const remainingUnits = equipmentUnits.filter(u => 
        u.equipment_id === equipmentId && u.id !== unitId
      );

      // Se não há mais unidades, excluir o equipamento também
      if (remainingUnits.length === 0) {
        const { error: equipmentError } = await supabase
          .from('equipment')
          .delete()
          .eq('id', equipmentId);

        if (equipmentError) throw equipmentError;

        toast({
          title: "Sucesso",
          description: `Unidade excluída e equipamento removido (não havia mais unidades).`,
        });
      } else {
        // Atualizar as quantidades do equipamento
        const available = remainingUnits.filter(u => u.status === 'available').length;
        const maintenance = remainingUnits.filter(u => u.status === 'maintenance').length;
        const unavailable = remainingUnits.filter(u => 
          ['em_evento', 'locacao'].includes(u.status)
        ).length;

        await supabase
          .from('equipment')
          .update({
            total_quantity: remainingUnits.length,
            available_quantity: available,
            maintenance_quantity: maintenance,
            unavailable_quantity: unavailable
          })
          .eq('id', equipmentId);

        toast({
          title: "Sucesso",
          description: `Unidade "${unitIdentifier}" excluída com sucesso.`,
        });
      }

      fetchData();
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir unidade.",
      });
    } finally {
      setShowDeleteUnitDialog(false);
      setDeleteUnitData(null);
    }
  };

  const deleteAllEquipment = async (equipmentId: string, equipmentName: string) => {
    // Verificar se há unidades em uso
    const units = equipmentUnits.filter(unit => unit.equipment_id === equipmentId);
    const unitsInUse = units.filter(unit => ['em_evento', 'locacao'].includes(unit.status));
    
    if (unitsInUse.length > 0) {
      toast({
        variant: "destructive",
        title: "Não é possível excluir",
        description: `Este equipamento possui ${unitsInUse.length} unidade(s) em uso (em evento ou locação).`,
      });
      return;
    }

    setDeleteEquipmentData({ equipmentId, equipmentName });
    setShowDeleteEquipmentDialog(true);
  };

  const handleConfirmDeleteEquipment = async () => {
    if (!deleteEquipmentData) return;
    
    const { equipmentId, equipmentName } = deleteEquipmentData;

    try {
      // Primeiro excluir todas as unidades
      const { error: unitsError } = await supabase
        .from('equipment_units')
        .delete()
        .eq('equipment_id', equipmentId);

      if (unitsError) throw unitsError;

      // Depois excluir o equipamento
      const { error: equipmentError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (equipmentError) throw equipmentError;

      toast({
        title: "Sucesso",
        description: `Equipamento "${equipmentName}" excluído com sucesso.`,
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir equipamento.",
      });
    } finally {
      setShowDeleteEquipmentDialog(false);
      setDeleteEquipmentData(null);
    }
  };

  const addUnit = async () => {
    if (!selectedEquipmentForUnit) return;

    try {
      const existingUnits = equipmentUnits.filter(u => u.equipment_id === selectedEquipmentForUnit.id);
      const nextNumber = existingUnits.length + 1;

      const { error: unitError } = await supabase
        .from('equipment_units')
        .insert([{
          equipment_id: selectedEquipmentForUnit.id,
          unit_identifier: `${selectedEquipmentForUnit.name} #${nextNumber}`,
          status: 'available'
        }]);

      if (unitError) throw unitError;

      // Atualizar quantidades do equipamento
      await supabase
        .from('equipment')
        .update({
          total_quantity: existingUnits.length + 1,
          available_quantity: selectedEquipmentForUnit.available_quantity + 1
        })
        .eq('id', selectedEquipmentForUnit.id);

      toast({
        title: "Sucesso",
        description: "Nova unidade adicionada com sucesso.",
      });

      setShowAddUnitDialog(false);
      setSelectedEquipmentForUnit(null);
      fetchData();
    } catch (error) {
      console.error('Error adding unit:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar unidade.",
      });
    }
  };

  // Filter equipment based on search, status and category
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || eq.category === categoryFilter;
    
    if (statusFilter === "all") return matchesSearch && matchesCategory;
    
    const units = equipmentUnits.filter(unit => unit.equipment_id === eq.id);
    const hasStatus = units.some(unit => unit.status === statusFilter);
    
    return matchesSearch && matchesCategory && hasStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success text-success-foreground";
      case "em_evento":
        return "bg-primary text-primary-foreground";
      case "maintenance":
        return "bg-destructive text-destructive-foreground";
      case "locacao":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "em_evento":
        return "Em Evento";
      case "maintenance":
        return "Em Manutenção";
      case "locacao":
        return "Locação";
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
    <div className="space-y-4 sm:space-y-6 bg-background p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Equipamentos</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Gestão completa de inventário</p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={() => setShowAddDialog(true)} 
            className="w-full sm:w-auto bg-primary text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:inline">Adicionar Equipamento</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card bg-card">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="em_evento">Em Evento</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="locacao">Locação</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEquipment.map((eq) => {
          const units = equipmentUnits.filter(unit => unit.equipment_id === eq.id);
          const availableUnits = units.filter(unit => unit.status === 'available').length;
          const emEventoUnits = units.filter(unit => unit.status === 'em_evento').length;
          const maintenanceUnits = units.filter(unit => unit.status === 'maintenance').length;
          const locacaoUnits = units.filter(unit => unit.status === 'locacao').length;

          return (
            <Card key={eq.id} className="shadow-card hover:shadow-elegant transition-all duration-300 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{eq.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{eq.category}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEquipment(eq);
                        setShowStatusDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEquipmentForUnit(eq);
                        setShowAddUnitDialog(true);
                      }}
                      className="text-primary hover:text-primary"
                      title="Adicionar mais uma unidade"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground flex items-center">
                      <Weight className="h-3 w-3 mr-1" />
                      Peso
                    </p>
                    <p className="text-foreground">{eq.weight}kg</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground flex items-center">
                      <Ruler className="h-3 w-3 mr-1" />
                      Dimensões
                    </p>
                    <p className="text-foreground text-xs">{eq.dimensions}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Status das Unidades:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-success">Disponível:</span>
                      <Badge variant="outline" className="text-success border-success">
                        {availableUnits}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary">Em Evento:</span>
                      <Badge variant="outline" className="text-primary border-primary">
                        {emEventoUnits}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-destructive">Manutenção:</span>
                      <Badge variant="outline" className="text-destructive border-destructive">
                        {maintenanceUnits}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-warning">Locação:</span>
                      <Badge variant="outline" className="text-warning border-warning">
                        {locacaoUnits}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total:</span>
                    <Badge variant="outline">{eq.total_quantity} unidades</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results */}
      {filteredEquipment.length === 0 && (
        <Card className="shadow-card bg-card">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum equipamento encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter ? 
                'Tente ajustar os filtros de busca.' : 
                'Adicione equipamentos para começar.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Equipamento *</Label>
              <Input
                id="name"
                placeholder="Ex: Mesa de Som Yamaha TF1"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={newEquipment.category}
                onValueChange={(value) => setNewEquipment({...newEquipment, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensões (com case) *</Label>
              <Input
                id="dimensions"
                placeholder="Ex: 60 cm x 40 cm x 20 cm"
                value={newEquipment.dimensions}
                onChange={(e) => {
                  // Format dimensions as user types
                  let value = e.target.value.replace(/[^\d\s]/g, '');
                  value = value.replace(/\s+/g, ' ').trim();
                  
                  const parts = value.split(' ').filter(p => p);
                  if (parts.length === 1 && parts[0].length > 0) {
                    value = parts[0] + ' cm x';
                  } else if (parts.length === 2) {
                    value = parts[0] + ' cm x ' + parts[1] + ' cm x';
                  } else if (parts.length >= 3) {
                    value = parts[0] + ' cm x ' + parts[1] + ' cm x ' + parts[2] + ' cm';
                  }
                  
                  setNewEquipment({...newEquipment, dimensions: value});
                }}
              />
              <p className="text-xs text-muted-foreground">
                Informe as dimensões considerando o equipamento dentro do case (formato: largura x altura x profundidade)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 25.5"
                value={newEquipment.weight}
                onChange={(e) => setNewEquipment({...newEquipment, weight: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Peso do equipamento com case (quando aplicável)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade de Unidades</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={newEquipment.total_quantity}
                onChange={(e) => setNewEquipment({...newEquipment, total_quantity: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addEquipment}>
                Adicionar Equipamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Management Dialog */}
      {selectedEquipment && (
        <Dialog open={showStatusDialog} onOpenChange={(open) => {
          if (!open) {
            setEditedUnits([]);
          }
          setShowStatusDialog(open);
        }}>
          <DialogContent className="sm:max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle>Gerenciar Status - {selectedEquipment.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              {equipmentUnits
                .filter(unit => unit.equipment_id === selectedEquipment.id)
                .map((unit) => {
                  const editedUnit = editedUnits.find(eu => eu.id === unit.id);
                  const currentUnit = editedUnit || unit;
                  
                  return (
                    <div key={unit.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={currentUnit.unit_identifier}
                          onChange={(e) => {
                            const updatedUnits = editedUnits.filter(eu => eu.id !== unit.id);
                            updatedUnits.push({
                              ...unit,
                              unit_identifier: e.target.value
                            });
                            setEditedUnits(updatedUnits);
                          }}
                          className="font-medium"
                        />
                      </div>
                      <Select
                        value={currentUnit.status}
                        onValueChange={(value) => {
                          const updatedUnits = editedUnits.filter(eu => eu.id !== unit.id);
                          updatedUnits.push({
                            ...unit,
                            unit_identifier: currentUnit.unit_identifier,
                            status: value
                          });
                          setEditedUnits(updatedUnits);
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="em_evento">Em Evento</SelectItem>
                          <SelectItem value="maintenance">Em Manutenção</SelectItem>
                          <SelectItem value="locacao">Locação</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={getStatusColor(currentUnit.status)}>
                        {getStatusText(currentUnit.status)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteUnit(unit.id, unit.unit_identifier, selectedEquipment.id)}
                        className="text-destructive hover:text-destructive"
                        title="Excluir esta unidade"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-between pt-4">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStatusDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowStatusDialog(false);
                    deleteAllEquipment(selectedEquipment.id, selectedEquipment.name);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Equipamento
                </Button>
              </div>
              <Button 
                onClick={async () => {
                  for (const editedUnit of editedUnits) {
                    await updateUnitStatus(editedUnit.id, editedUnit.status);
                    await updateUnitIdentifier(editedUnit.id, editedUnit.unit_identifier);
                  }
                  setEditedUnits([]);
                  setShowStatusDialog(false);
                }}
                disabled={editedUnits.length === 0}
              >
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Unit Dialog */}
      <Dialog open={showAddUnitDialog} onOpenChange={setShowAddUnitDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>
              Adicionar Unidade - {selectedEquipmentForUnit?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Será adicionada uma nova unidade disponível deste equipamento.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddUnitDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addUnit}>
                Adicionar Unidade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Unit Confirmation Dialog */}
      <AlertDialog open={showDeleteUnitDialog} onOpenChange={setShowDeleteUnitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{deleteUnitData?.unitIdentifier}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteUnit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Equipment Confirmation Dialog */}
      <AlertDialog open={showDeleteEquipmentDialog} onOpenChange={setShowDeleteEquipmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o equipamento "{deleteEquipmentData?.equipmentName}" e todas as suas unidades?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteEquipment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveWrapper>
  );
};

export default Equipamentos;