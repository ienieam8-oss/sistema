import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp, user, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: error.message,
      });
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Redirecionando para o dashboard...',
      });
    }

    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message,
      });
    } else {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Você pode fazer login agora.',
      });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-xl md:text-2xl font-bold text-primary">EventPro</CardTitle>
          <p className="text-sm md:text-base text-muted-foreground">Sistema de Gestão de Eventos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-sm font-medium">Senha</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                placeholder="Sua senha"
                className="h-11"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogIn className="h-4 w-4 mr-2" />
              )}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;