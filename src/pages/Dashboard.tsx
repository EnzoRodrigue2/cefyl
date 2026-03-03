import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, FileText, Clock, GraduationCap, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ESTADO_COLORS: Record<string, string> = {
  borrador: 'bg-muted text-muted-foreground',
  pendiente_pago: 'bg-warning/20 text-warning',
  pagado: 'bg-secondary/20 text-secondary',
  en_proceso: 'bg-primary/20 text-primary',
  finalizada: 'bg-success/20 text-success',
  lista_retirar: 'bg-accent/20 text-accent',
  retirada: 'bg-muted text-muted-foreground',
  cancelada: 'bg-destructive/20 text-destructive',
};

const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  lista_retirar: 'Lista para retirar',
  retirada: 'Retirada',
  cancelada: 'Cancelada',
};

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [beca, setBeca] = useState<any>(null);
  const [becaUso, setBecaUso] = useState<number>(0);
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    const [profileRes, ordenesRes, becaRes, configRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('ordenes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('becas').select('*').eq('user_id', user!.id).eq('estado', 'aprobada').maybeSingle(),
      supabase.from('configuraciones').select('*'),
    ]);
    setProfile(profileRes.data);
    setOrdenes(ordenesRes.data || []);
    setBeca(becaRes.data);
    
    const cfgMap: Record<string, string> = {};
    configRes.data?.forEach((c: any) => { cfgMap[c.clave] = c.valor; });
    setConfig(cfgMap);

    if (becaRes.data?.tipo === '100') {
      const now = new Date();
      const usoRes = await supabase.from('beca_uso_mensual').select('monto_usado')
        .eq('user_id', user!.id).eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()).maybeSingle();
      setBecaUso(Number(usoRes.data?.monto_usado || 0));
    }
  }

  const limiteBeca = Number(config.limite_beca_100 || 5000);
  const saldoDisponible = limiteBeca - becaUso;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary">
            <Printer className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">PrintHub</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Panel Admin</Button>}
          <span className="text-sm text-muted-foreground">{profile?.nombre_completo}</span>
          <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Mis órdenes</CardDescription>
              <CardTitle className="text-2xl">{ordenes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Beca</CardDescription>
              <CardTitle className="text-2xl">{beca ? `${beca.tipo}%` : 'Sin beca'}</CardTitle>
            </CardHeader>
          </Card>
          {beca?.tipo === '100' && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Saldo beca mensual</CardDescription>
                <CardTitle className={`text-2xl ${saldoDisponible < 1000 ? 'text-destructive' : ''}`}>
                  ${saldoDisponible.toLocaleString('es-AR')}
                </CardTitle>
              </CardHeader>
              {saldoDisponible < 1000 && (
                <CardContent className="pt-0">
                  <p className="text-xs text-destructive">⚠️ Te queda poco saldo este mes</p>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* New order button */}
        <Button onClick={() => navigate('/nueva-orden')} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva impresión
        </Button>

        {/* Orders list */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            {ordenes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tenés órdenes todavía. ¡Creá tu primera impresión!</p>
            ) : (
              <div className="space-y-3">
                {ordenes.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">{o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                    <Badge className={ESTADO_COLORS[o.estado] || ''}>{ESTADO_LABELS[o.estado] || o.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
