import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users, 
  UserCheck, 
  Edit,
  Calendar,
  DollarSign,
  MapPin,
  Search,
  Trash2,
  Upload,
  Download,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Funcionarios = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [employeeDailies, setEmployeeDailies] = useState<any[]>([]);
  const [employeePayments, setEmployeePayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("fixos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDailyDialog, setShowDailyDialog] = useState(false);
  const [showEditDailyDialog, setShowEditDailyDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedDaily, setSelectedDaily] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDeleteEmployeeDialog, setShowDeleteEmployeeDialog] = useState(false);
  const [showDeleteDailyDialog, setShowDeleteDailyDialog] = useState(false);
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false);
  const [deleteEmployeeData, setDeleteEmployeeData] = useState<{employeeId: string, employeeName: string} | null>(null);
  const [deleteDailyData, setDeleteDailyData] = useState<{dailyId: string} | null>(null);
  const [deletePaymentData, setDeletePaymentData] = useState<{paymentId: string} | null>(null);
  const [editEmployee, setEditEmployee] = useState({
    id: "",
    name: "",
    position: "",
    type: "fixed",
    fixed_salary: "",
    daily_rate: "",
    hire_date: ""
  });
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    type: "fixed",
    fixed_salary: "",
    daily_rate: "",
    hire_date: ""
  });
  const [newDaily, setNewDaily] = useState({
    employee_id: "",
    event_id: "",
    service_date: "",
    daily_value: "",
    additional_value: "",
    description: ""
  });
  const [editDaily, setEditDaily] = useState({
    id: "",
    employee_id: "",
    event_id: "",
    service_date: "",
    daily_value: "",
    additional_value: "",
    description: ""
  });
  const [newPayment, setNewPayment] = useState({
    employee_id: "",
    payment_date: "",
    amount: "",
    description: "",
    receipt_file: null as File | null
  });
  const [editPayment, setEditPayment] = useState({
    id: "",
    employee_id: "",
    payment_date: "",
    amount: "",
    description: "",
    receipt_url: "",
    receipt_file: null as File | null
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
        .order('event_date');

      if (eventsError) throw eventsError;

      // Fetch employee dailies
      const { data: dailiesData, error: dailiesError } = await supabase
        .from('employee_dailies')
        .select(`
          *, 
          employees(name, type), 
          events(client_name, event_date, event_location)
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
      setEmployeeDailies(dailiesData || []);
      setEmployeePayments(paymentsData || []);
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

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.type) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome e tipo são obrigatórios.",
      });
      return;
    }

    try {
      const employeeData: any = {
        name: newEmployee.name,
        position: newEmployee.position,
        type: newEmployee.type
      };

      if (newEmployee.type === 'fixed') {
        employeeData.fixed_salary = newEmployee.fixed_salary ? parseFloat(newEmployee.fixed_salary) : null;
        employeeData.hire_date = newEmployee.hire_date || null;
      } else {
        employeeData.daily_rate = newEmployee.daily_rate ? parseFloat(newEmployee.daily_rate) : null;
      }

      const { error } = await supabase
        .from('employees')
        .insert([employeeData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso.",
      });

      resetForm();
      setShowAddDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar funcionário.",
      });
    }
  };

  const updateEmployee = async () => {
    if (!editEmployee.name || !editEmployee.type) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome e tipo são obrigatórios.",
      });
      return;
    }

    try {
      const employeeData: any = {
        name: editEmployee.name,
        position: editEmployee.position,
        type: editEmployee.type
      };

      if (editEmployee.type === 'fixed') {
        employeeData.fixed_salary = editEmployee.fixed_salary ? parseFloat(editEmployee.fixed_salary) : null;
        employeeData.hire_date = editEmployee.hire_date || null;
      } else {
        employeeData.daily_rate = editEmployee.daily_rate ? parseFloat(editEmployee.daily_rate) : null;
      }

      const { error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', editEmployee.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso.",
      });

      setShowEditDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar funcionário.",
      });
    }
  };

  const updateDaily = async () => {
    const selectedEmp = employees.find(e => e.id === editDaily.employee_id);
    
    if (!editDaily.employee_id || !editDaily.service_date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Funcionário e data são obrigatórios.",
      });
      return;
    }

    if (selectedEmp?.type === 'fixed' && !editDaily.additional_value) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Valor adicional é obrigatório para funcionários fixos.",
      });
      return;
    }

    if (selectedEmp?.type === 'freelancer' && !editDaily.daily_value) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",  
        description: "Valor da diária é obrigatório para freelancers.",
      });
      return;
    }

    try {
      const dailyData: any = {
        employee_id: editDaily.employee_id,
        event_id: editDaily.event_id === 'none' ? null : editDaily.event_id,
        service_date: editDaily.service_date,
        description: editDaily.description,
        status: 'completed'
      };

      if (selectedEmp?.type === 'fixed') {
        dailyData.daily_value = 0;
        dailyData.additional_value = parseFloat(editDaily.additional_value);
      } else {
        dailyData.daily_value = parseFloat(editDaily.daily_value);
        dailyData.additional_value = 0;
      }

      const { error } = await supabase
        .from('employee_dailies')
        .update(dailyData)
        .eq('id', editDaily.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: selectedEmp?.type === 'fixed' ? "Valor adicional atualizado com sucesso." : "Diária atualizada com sucesso.",
      });

      setShowEditDailyDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error updating daily:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: selectedEmp?.type === 'fixed' ? "Erro ao atualizar valor adicional." : "Erro ao atualizar diária.",
      });
    }
  };

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    const { data: dailiesData, error: dailiesError } = await supabase
      .from('employee_dailies')
      .select('id')
      .eq('employee_id', employeeId);

    if (dailiesError) {
      console.error('Error checking dailies:', dailiesError);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao verificar registros do funcionário.",
      });
      return;
    }

    if (dailiesData && dailiesData.length > 0) {
      toast({
        variant: "destructive", 
        title: "Não é possível excluir",
        description: `Este funcionário possui ${dailiesData.length} registro(s) de pagamento. Exclua os registros primeiro.`,
      });
      return;
    }

    setDeleteEmployeeData({ employeeId, employeeName });
    setShowDeleteEmployeeDialog(true);
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!deleteEmployeeData) return;
    
    const { employeeId, employeeName } = deleteEmployeeData;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Funcionário "${employeeName}" excluído com sucesso.`,
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir funcionário.",
      });
    } finally {
      setShowDeleteEmployeeDialog(false);
      setDeleteEmployeeData(null);
    }
  };

  const addPayment = async () => {
    if (!newPayment.employee_id || !newPayment.payment_date || !newPayment.amount) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Funcionário, data e valor são obrigatórios.",
      });
      return;
    }

    try {
      let receiptUrl = null;
      
      // Upload receipt file if provided
      if (newPayment.receipt_file) {
        const fileExt = newPayment.receipt_file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(fileName, newPayment.receipt_file);

        if (uploadError) throw uploadError;
        receiptUrl = fileName;
      }

      const { error } = await supabase
        .from('employee_payments')
        .insert([{
          employee_id: newPayment.employee_id,
          payment_date: newPayment.payment_date,
          amount: parseFloat(newPayment.amount),
          description: newPayment.description,
          receipt_url: receiptUrl
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso.",
      });

      resetPaymentForm();
      setShowPaymentDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao registrar pagamento.",
      });
    }
  };

  const updatePayment = async () => {
    if (!editPayment.employee_id || !editPayment.payment_date || !editPayment.amount) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Funcionário, data e valor são obrigatórios.",
      });
      return;
    }

    try {
      let receiptUrl = editPayment.receipt_url;
      
      // Upload new receipt file if provided
      if (editPayment.receipt_file) {
        // Delete old file if exists
        if (editPayment.receipt_url) {
          await supabase.storage
            .from('payment-receipts')
            .remove([editPayment.receipt_url]);
        }
        
        const fileExt = editPayment.receipt_file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(fileName, editPayment.receipt_file);

        if (uploadError) throw uploadError;
        receiptUrl = fileName;
      }

      const { error } = await supabase
        .from('employee_payments')
        .update({
          employee_id: editPayment.employee_id,
          payment_date: editPayment.payment_date,
          amount: parseFloat(editPayment.amount),
          description: editPayment.description,
          receipt_url: receiptUrl
        })
        .eq('id', editPayment.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso.",
      });

      setShowEditPaymentDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar pagamento.",
      });
    }
  };

  const deletePayment = async (paymentId: string) => {
    setDeletePaymentData({ paymentId });
    setShowDeletePaymentDialog(true);
  };

  const handleConfirmDeletePayment = async () => {
    if (!deletePaymentData) return;
    
    const { paymentId } = deletePaymentData;

    try {
      // Get payment data to delete receipt file
      const { data: paymentData } = await supabase
        .from('employee_payments')
        .select('receipt_url')
        .eq('id', paymentId)
        .single();

      // Delete receipt file if exists
      if (paymentData?.receipt_url) {
        await supabase.storage
          .from('payment-receipts')
          .remove([paymentData.receipt_url]);
      }

      const { error } = await supabase
        .from('employee_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir pagamento.",
      });
    } finally {
      setShowDeletePaymentDialog(false);
      setDeletePaymentData(null);
    }
  };

  const downloadReceipt = async (receiptUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .download(receiptUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = receiptUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao baixar comprovante.",
      });
    }
  };

  const deleteDaily = async (dailyId: string) => {
    setDeleteDailyData({ dailyId });
    setShowDeleteDailyDialog(true);
  };

  const handleConfirmDeleteDaily = async () => {
    if (!deleteDailyData) return;
    
    const { dailyId } = deleteDailyData;

    try {
      const { error } = await supabase
        .from('employee_dailies')
        .delete()
        .eq('id', dailyId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting daily:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir pagamento.",
      });
    } finally {
      setShowDeleteDailyDialog(false);
      setDeleteDailyData(null);
    }
  };

  const addDaily = async () => {
    const selectedEmp = employees.find(e => e.id === newDaily.employee_id);
    
    if (!newDaily.employee_id || !newDaily.service_date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Funcionário e data são obrigatórios.",
      });
      return;
    }

    if (selectedEmp?.type === 'fixed' && !newDaily.additional_value) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Valor adicional é obrigatório para funcionários fixos.",
      });
      return;
    }

    if (selectedEmp?.type === 'freelancer' && !newDaily.daily_value) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",  
        description: "Valor da diária é obrigatório para freelancers.",
      });
      return;
    }

    try {
      const dailyData: any = {
        employee_id: newDaily.employee_id,
        event_id: newDaily.event_id === 'none' ? null : newDaily.event_id,
        service_date: newDaily.service_date,
        description: newDaily.description,
        status: 'completed'
      };

      if (selectedEmp?.type === 'fixed') {
        dailyData.daily_value = 0;
        dailyData.additional_value = parseFloat(newDaily.additional_value);
      } else {
        dailyData.daily_value = parseFloat(newDaily.daily_value);
        dailyData.additional_value = 0;
      }

      const { error } = await supabase
        .from('employee_dailies')
        .insert([dailyData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: selectedEmp?.type === 'fixed' ? "Valor adicional adicionado com sucesso." : "Diária adicionada com sucesso.",
      });

      resetDailyForm();
      setShowDailyDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding daily:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: selectedEmp?.type === 'fixed' ? "Erro ao adicionar valor adicional." : "Erro ao adicionar diária.",
      });
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: "",
      position: "",
      type: "fixed",
      fixed_salary: "",
      daily_rate: "",
      hire_date: ""
    });
  };

  const resetDailyForm = () => {
    setNewDaily({
      employee_id: "",
      event_id: "",
      service_date: "",
      daily_value: "",
      additional_value: "",
      description: ""
    });
  };

  const resetPaymentForm = () => {
    setNewPayment({
      employee_id: "",
      payment_date: "",
      amount: "",
      description: "",
      receipt_file: null
    });
  };

  const openEditDialog = (employee: any) => {
    setEditEmployee({
      id: employee.id,
      name: employee.name,
      position: employee.position || "",
      type: employee.type,
      fixed_salary: employee.fixed_salary?.toString() || "",
      daily_rate: employee.daily_rate?.toString() || "",
      hire_date: employee.hire_date || ""
    });
    setShowEditDialog(true);
  };

  const openEditDailyDialog = (daily: any) => {
    setEditDaily({
      id: daily.id,
      employee_id: daily.employee_id,
      event_id: daily.event_id || 'none',
      service_date: daily.service_date,
      daily_value: daily.daily_value?.toString() || "",
      additional_value: daily.additional_value?.toString() || "",
      description: daily.description || ""
    });
    setSelectedDaily(daily);
    setShowEditDailyDialog(true);
  };

  const openEditPaymentDialog = (payment: any) => {
    setEditPayment({
      id: payment.id,
      employee_id: payment.employee_id,
      payment_date: payment.payment_date,
      amount: payment.amount?.toString() || "",
      description: payment.description || "",
      receipt_url: payment.receipt_url || "",
      receipt_file: null
    });
    setSelectedPayment(payment);
    setShowEditPaymentDialog(true);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fixedEmployees = filteredEmployees.filter(emp => emp.type === 'fixed');
  const freelancers = filteredEmployees.filter(emp => emp.type === 'freelancer');

  const getEmployeeDailies = (employeeId: string) => {
    return employeeDailies.filter(daily => daily.employee_id === employeeId);
  };

  const getEmployeePayments = (employeeId: string) => {
    return employeePayments.filter(payment => payment.employee_id === employeeId);
  };

  const getEmployeeAdditionalTotal = (employeeId: string) => {
    const dailies = getEmployeeDailies(employeeId);
    return dailies.reduce((sum, daily) => sum + Number(daily.additional_value || 0), 0);
  };

  const getEmployeeDailyTotal = (employeeId: string) => {
    const dailies = getEmployeeDailies(employeeId);
    return dailies.reduce((sum, daily) => sum + Number(daily.daily_value || 0), 0);
  };

  const getEmployeePaymentTotal = (employeeId: string) => {
    const payments = getEmployeePayments(employeeId);
    return payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  };

  const getEmployeeBalance = (employeeId: string) => {
    const dailyTotal = getEmployeeDailyTotal(employeeId);
    const paymentTotal = getEmployeePaymentTotal(employeeId);
    return dailyTotal - paymentTotal;
  };

  const getFixedEmployeeBalance = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || employee.type !== 'fixed') return 0;
    
    const additionalTotal = getEmployeeAdditionalTotal(employeeId);
    const paymentTotal = getEmployeePaymentTotal(employeeId);
    const fixedSalary = Number(employee.fixed_salary || 0);
    
    return (fixedSalary + additionalTotal) - paymentTotal;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-primary text-primary-foreground";
      case "confirmed":
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
      case "confirmed":
        return "Confirmado";
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
    <div className="space-y-4 sm:space-y-6 bg-background p-2 sm:p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Funcionários</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestão de funcionários fixos e freelancers
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-card bg-card">
        <CardContent className="p-3 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <Card className="shadow-card bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funcionários Fixos</p>
                <p className="text-2xl font-bold text-foreground">{fixedEmployees.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Freelancers</p>
                <p className="text-2xl font-bold text-foreground">{freelancers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto justify-start">
            <TabsTrigger value="fixos" className="text-xs sm:text-sm">Fixos</TabsTrigger>
            <TabsTrigger value="freelancers" className="text-xs sm:text-sm">Freelancers</TabsTrigger>
            <TabsTrigger value="dailies" className="text-xs sm:text-sm">Diárias</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <Button 
              onClick={() => setShowPaymentDialog(true)} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Registrar</span> Pagamento
            </Button>
            <Button 
              onClick={() => setShowDailyDialog(true)} 
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span> Diária
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              Novo <span className="hidden sm:inline">Funcionário</span>
            </Button>
          </div>
        </div>

        {/* Funcionários Fixos */}
        <TabsContent value="fixos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {fixedEmployees.map((employee) => {
              const additionalTotal = getEmployeeAdditionalTotal(employee.id);
              const totalPaid = getEmployeePaymentTotal(employee.id);
              const totalDebit = getFixedEmployeeBalance(employee.id);

              return (
                <Card key={employee.id} className="shadow-card hover:shadow-elegant transition-all duration-300 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteEmployee(employee.id, employee.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNewDaily({
                              ...newDaily,
                              employee_id: employee.id
                            });
                            setShowDailyDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicional
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNewPayment({
                              ...newPayment,
                              employee_id: employee.id
                            });
                            setShowPaymentDialog(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pagamento
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.position || 'Cargo não informado'}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Salário Fixo</p>
                        <p className="text-lg font-semibold text-success">
                          {employee.fixed_salary ? 
                            `R$ ${Number(employee.fixed_salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                            'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Total Adicionais</p>
                        <p className="text-lg font-semibold text-primary">
                          R$ {additionalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Total Pago</p>
                        <p className="text-lg font-semibold text-success">
                          R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Débito Total</p>
                        <p className={`text-lg font-semibold ${totalDebit > 0 ? 'text-warning' : totalDebit < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          R$ {totalDebit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {employee.hire_date && (
                      <div className="text-center pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Contratado em</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(employee.hire_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Freelancers */}
        <TabsContent value="freelancers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {freelancers.map((freelancer) => {
              const freelancerDailies = getEmployeeDailies(freelancer.id);
              const totalEarnings = getEmployeeDailyTotal(freelancer.id);
              const totalPaid = getEmployeePaymentTotal(freelancer.id);
              const balance = getEmployeeBalance(freelancer.id);

              return (
                <Card key={freelancer.id} className="shadow-card hover:shadow-elegant transition-all duration-300 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{freelancer.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(freelancer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteEmployee(freelancer.id, freelancer.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNewDaily({
                              ...newDaily,
                              employee_id: freelancer.id,
                              daily_value: freelancer.daily_rate?.toString() || ""
                            });
                            setShowDailyDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Diária
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNewPayment({
                              ...newPayment,
                              employee_id: freelancer.id
                            });
                            setShowPaymentDialog(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pagamento
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{freelancer.position || 'Cargo não informado'}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Valor Diária Sugerido</p>
                        <p className="text-lg font-semibold text-muted-foreground">
                          {freelancer.daily_rate ? 
                            `R$ ${Number(freelancer.daily_rate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                            'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Total Diárias</p>
                        <p className="text-lg font-semibold text-primary">
                          R$ {totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Total Pago</p>
                        <p className="text-lg font-semibold text-success">
                          R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Em Débito</p>
                        <p className={`text-lg font-semibold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {freelancerDailies.length} diária(s) registrada(s)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Diárias e Pagamentos */}
        <TabsContent value="dailies" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {employeeDailies.map((daily) => (
              <Card key={daily.id} className="shadow-card bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{daily.employees?.name}</h4>
                        <Badge className={getStatusColor(daily.status)}>
                          {getStatusText(daily.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(daily.service_date), 'dd/MM/yyyy')}</span>
                          </div>
                          {daily.events && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{daily.events.client_name}</span>
                            </div>
                          )}
                        </div>
                        {daily.description && (
                          <p className="text-xs">{daily.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          R$ {(Number(daily.daily_value || 0) + Number(daily.additional_value || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {daily.employees?.type === 'fixed' ? 'Adicional' : 'Diária'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDailyDialog(daily)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteDaily(daily.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <h3 className="text-lg font-semibold mt-8 mb-4">Pagamentos Registrados</h3>
            {employeePayments.map((payment) => (
              <Card key={payment.id} className="shadow-card bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{payment.employees?.name}</h4>
                        <Badge className="bg-success text-success-foreground">Pago</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(payment.payment_date), 'dd/MM/yyyy')}</span>
                        </div>
                        {payment.description && (
                          <p className="text-xs">{payment.description}</p>
                        )}
                        {payment.receipt_url && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">Comprovante anexado</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold text-success">
                          R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">Pagamento</p>
                      </div>
                      {payment.receipt_url && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadReceipt(payment.receipt_url)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditPaymentDialog(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deletePayment(payment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                placeholder="Nome do funcionário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="Cargo do funcionário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={newEmployee.type}
                onValueChange={(value) => setNewEmployee({...newEmployee, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newEmployee.type === 'fixed' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fixed_salary">Salário Fixo</Label>
                  <Input
                    id="fixed_salary"
                    type="number"
                    step="0.01"
                    value={newEmployee.fixed_salary}
                    onChange={(e) => setNewEmployee({...newEmployee, fixed_salary: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Data de Contratação</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newEmployee.hire_date}
                    onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Valor Diária Sugerido</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={newEmployee.daily_rate}
                  onChange={(e) => setNewEmployee({...newEmployee, daily_rate: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addEmployee}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Nome *</Label>
              <Input
                id="edit_name"
                value={editEmployee.name}
                onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                placeholder="Nome do funcionário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_position">Cargo</Label>
              <Input
                id="edit_position"
                value={editEmployee.position}
                onChange={(e) => setEditEmployee({...editEmployee, position: e.target.value})}
                placeholder="Cargo do funcionário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_type">Tipo *</Label>
              <Select
                value={editEmployee.type}
                onValueChange={(value) => setEditEmployee({...editEmployee, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editEmployee.type === 'fixed' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit_fixed_salary">Salário Fixo</Label>
                  <Input
                    id="edit_fixed_salary"
                    type="number"
                    step="0.01"
                    value={editEmployee.fixed_salary}
                    onChange={(e) => setEditEmployee({...editEmployee, fixed_salary: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_hire_date">Data de Contratação</Label>
                  <Input
                    id="edit_hire_date"
                    type="date"
                    value={editEmployee.hire_date}
                    onChange={(e) => setEditEmployee({...editEmployee, hire_date: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit_daily_rate">Valor Diária Sugerido</Label>
                <Input
                  id="edit_daily_rate"
                  type="number"
                  step="0.01"
                  value={editEmployee.daily_rate}
                  onChange={(e) => setEditEmployee({...editEmployee, daily_rate: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={updateEmployee}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Daily Dialog */}
      <Dialog open={showDailyDialog} onOpenChange={setShowDailyDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>
              {employees.find(e => e.id === newDaily.employee_id)?.type === 'fixed' ? 
                'Adicionar Valor Adicional' : 
                'Adicionar Diária'
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="daily_employee">Funcionário *</Label>
              <Select
                value={newDaily.employee_id}
                onValueChange={(value) => {
                  const selectedEmp = employees.find(e => e.id === value);
                  setNewDaily({
                    ...newDaily, 
                    employee_id: value,
                    daily_value: selectedEmp?.type === 'freelancer' ? selectedEmp?.daily_rate?.toString() || "" : ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.type === 'fixed' ? 'Fixo' : 'Freelancer'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_event">Evento</Label>
              <Select
                value={newDaily.event_id}
                onValueChange={(value) => setNewDaily({...newDaily, event_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o evento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem evento específico</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.client_name} - {format(new Date(event.event_date), 'dd/MM/yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_date">Data *</Label>
              <Input
                id="daily_date"
                type="date"
                value={newDaily.service_date}
                onChange={(e) => setNewDaily({...newDaily, service_date: e.target.value})}
              />
            </div>

            {employees.find(e => e.id === newDaily.employee_id)?.type === 'fixed' ? (
              <div className="space-y-2">
                <Label htmlFor="additional_value">Valor Adicional *</Label>
                <Input
                  id="additional_value"
                  type="number"
                  step="0.01"
                  value={newDaily.additional_value}
                  onChange={(e) => setNewDaily({...newDaily, additional_value: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="daily_value">Valor da Diária *</Label>
                <Input
                  id="daily_value"
                  type="number"
                  step="0.01"
                  value={newDaily.daily_value}
                  onChange={(e) => setNewDaily({...newDaily, daily_value: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="daily_description">Descrição</Label>
              <Textarea
                id="daily_description"
                value={newDaily.description}
                onChange={(e) => setNewDaily({...newDaily, description: e.target.value})}
                placeholder="Descrição do trabalho realizado..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowDailyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addDaily}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Daily Dialog */}
      <Dialog open={showEditDailyDialog} onOpenChange={setShowEditDailyDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>
              {employees.find(e => e.id === editDaily.employee_id)?.type === 'fixed' ? 
                'Editar Valor Adicional' : 
                'Editar Diária'
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_daily_employee">Funcionário *</Label>
              <Select
                value={editDaily.employee_id}
                onValueChange={(value) => setEditDaily({...editDaily, employee_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.type === 'fixed' ? 'Fixo' : 'Freelancer'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_daily_event">Evento</Label>
              <Select
                value={editDaily.event_id}
                onValueChange={(value) => setEditDaily({...editDaily, event_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o evento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem evento específico</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.client_name} - {format(new Date(event.event_date), 'dd/MM/yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_daily_date">Data *</Label>
              <Input
                id="edit_daily_date"
                type="date"
                value={editDaily.service_date}
                onChange={(e) => setEditDaily({...editDaily, service_date: e.target.value})}
              />
            </div>

            {employees.find(e => e.id === editDaily.employee_id)?.type === 'fixed' ? (
              <div className="space-y-2">
                <Label htmlFor="edit_additional_value">Valor Adicional *</Label>
                <Input
                  id="edit_additional_value"
                  type="number"
                  step="0.01"
                  value={editDaily.additional_value}
                  onChange={(e) => setEditDaily({...editDaily, additional_value: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit_daily_value">Valor da Diária *</Label>
                <Input
                  id="edit_daily_value"
                  type="number"
                  step="0.01"
                  value={editDaily.daily_value}
                  onChange={(e) => setEditDaily({...editDaily, daily_value: e.target.value})}
                  placeholder="0,00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit_daily_description">Descrição</Label>
              <Textarea
                id="edit_daily_description"
                value={editDaily.description}
                onChange={(e) => setEditDaily({...editDaily, description: e.target.value})}
                placeholder="Descrição do trabalho realizado..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDailyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={updateDaily}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment_employee">Funcionário *</Label>
              <Select
                value={newPayment.employee_id}
                onValueChange={(value) => setNewPayment({...newPayment, employee_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {freelancers.map((freelancer) => (
                    <SelectItem key={freelancer.id} value={freelancer.id}>
                      {freelancer.name} - Débito: R$ {getEmployeeBalance(freelancer.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                  {fixedEmployees.map((fixed) => (
                    <SelectItem key={fixed.id} value={fixed.id}>
                      {fixed.name} - Débito: R$ {getFixedEmployeeBalance(fixed.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Data do Pagamento *</Label>
              <Input
                id="payment_date"
                type="date"
                value={newPayment.payment_date}
                onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_amount">Valor Pago *</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_description">Descrição</Label>
              <Textarea
                id="payment_description"
                value={newPayment.description}
                onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                placeholder="Descrição do pagamento..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_receipt">Comprovante</Label>
              <Input
                id="payment_receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewPayment({...newPayment, receipt_file: e.target.files?.[0] || null})}
              />
              <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG</p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={addPayment}>
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_payment_employee">Funcionário *</Label>
              <Select
                value={editPayment.employee_id}
                onValueChange={(value) => setEditPayment({...editPayment, employee_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.type === 'fixed' ? 'Fixo' : 'Freelancer'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_payment_date">Data do Pagamento *</Label>
              <Input
                id="edit_payment_date"
                type="date"
                value={editPayment.payment_date}
                onChange={(e) => setEditPayment({...editPayment, payment_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_payment_amount">Valor Pago *</Label>
              <Input
                id="edit_payment_amount"
                type="number"
                step="0.01"
                value={editPayment.amount}
                onChange={(e) => setEditPayment({...editPayment, amount: e.target.value})}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_payment_description">Descrição</Label>
              <Textarea
                id="edit_payment_description"
                value={editPayment.description}
                onChange={(e) => setEditPayment({...editPayment, description: e.target.value})}
                placeholder="Descrição do pagamento..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_payment_receipt">Comprovante</Label>
              {editPayment.receipt_url && (
                <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Comprovante atual anexado</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadReceipt(editPayment.receipt_url)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                id="edit_payment_receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setEditPayment({...editPayment, receipt_file: e.target.files?.[0] || null})}
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, JPG, PNG {editPayment.receipt_url ? "(substituirá o arquivo atual)" : ""}
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditPaymentDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={updatePayment}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Confirmation Dialog */}
      <AlertDialog open={showDeleteEmployeeDialog} onOpenChange={setShowDeleteEmployeeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário "{deleteEmployeeData?.employeeName}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Daily Confirmation Dialog */}
      <AlertDialog open={showDeleteDailyDialog} onOpenChange={setShowDeleteDailyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteDaily}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Payment Confirmation Dialog */}
      <AlertDialog open={showDeletePaymentDialog} onOpenChange={setShowDeletePaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento?
              Esta ação não pode ser desfeita e o comprovante anexado também será excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeletePayment}
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

export default Funcionarios;