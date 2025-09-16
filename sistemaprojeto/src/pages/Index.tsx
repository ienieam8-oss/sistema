import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, Users, Package, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 md:py-12 pb-safe-area-inset-bottom">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
            EventPro
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Sistema completo de gestão de eventos para sua empresa. Gerencie funcionários, equipamentos, eventos e financeiro de forma integrada e eficiente.
          </p>
          <Link to="/auth">
            <Button size="lg" className="group w-full sm:w-auto min-h-[48px] text-base font-medium">
              Acessar Sistema
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Gestão de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Controle completo de funcionários fixos e freelancers com gestão salarial integrada.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inventário completo com controle de status, localização e disponibilidade em tempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planejamento e gestão completa de eventos com geração automática de fichas em PDF.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Relatórios Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dashboard completo com métricas, custos, receitas e análises detalhadas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center px-4">
          <Card className="max-w-2xl mx-auto shadow-card">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Pronto para começar?</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Acesse o sistema e descubra como o EventPro pode transformar a gestão dos seus eventos.
              </p>
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                  Fazer Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
