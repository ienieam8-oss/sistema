import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Users, Plus, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const { profile, isAdmin, signUp } = useAuth();
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user"
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    fetchCompanySettings();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCompanySettings(data);
      } else {
        // Criar configurações padrão se não existirem
        const { data: newSettings, error: insertError } = await supabase
          .from('company_settings')
          .insert([{ notifications_enabled: true }])
          .select()
          .maybeSingle();
        
        if (insertError) throw insertError;
        setCompanySettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const updateNotificationSettings = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ notifications_enabled: enabled })
        .eq('id', companySettings.id);

      if (error) throw error;

      setCompanySettings({
        ...companySettings,
        notifications_enabled: enabled
      });

      toast({
        title: "Sucesso",
        description: `Notificações ${enabled ? 'ativadas' : 'desativadas'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar configurações de notificação.",
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(
        newUser.email,
        newUser.password,
        newUser.fullName,
        newUser.role
      );

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso.",
      });

      setNewUser({
        email: "",
        password: "",
        fullName: "",
        role: "user"
      });
      setShowAddUserDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar usuário.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive text-destructive-foreground';
      case 'secretary':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'secretary':
        return 'Secretário';
      default:
        return 'Usuário';
    }
  };

  return (
    <div className="space-y-6 bg-background">
      <div>
        <h2 className="text-3xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Configurações do sistema e usuários</p>
      </div>
      
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Função:</strong> {getRoleText(profile?.role || '')}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Receber notificações</p>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar notificações do sistema
              </p>
            </div>
            <Switch
              checked={companySettings?.notifications_enabled || false}
              onCheckedChange={updateNotificationSettings}
            />
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gerenciar Usuários
                </div>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.full_name || 'Nome não informado'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleText(user.role)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogContent className="sm:max-w-md bg-card">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="Nome completo do usuário"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Senha (mínimo 6 caracteres)"
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="secretary">Secretário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Configuracoes;