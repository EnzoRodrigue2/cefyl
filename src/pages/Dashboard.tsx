import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Printer, FileText, Clock, GraduationCap, Plus, LogOut, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// User-facing labels: map estado_produccion to friendly text
const ESTADO_USUARIO_LABELS: Record<string, string> = {
  para_hacer: 'Pendiente de impresión',
  hecho: 'Pedido impreso',
  retirado: 'Retirado',
};

const ESTADO_USUARIO_COLORS: Record<string, string> = {
  para_hacer: 'bg-yellow-500/20 text-yellow-700',
  hecho: 'bg-green-500/20 text-green-700',
  retirado: 'bg-muted text-muted-foreground',
};

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [becaActiva, setBecaActiva] = useState<any>(null);
  const [becaUso, setBecaUso] = useState(0); // carillas used
  const [limiteBeca, setLimiteBeca] = useState(500);

  useEffect(() => {
    if (searchParams.get('pedido') === 'confirmado' || searchParams.get('status') === 'approved') {
      setShowConfirmation(true);
      searchParams.delete('pedido');
      searchParams.delete('status');
      searchParams.delete('collection_id');
      searchParams.delete('collection_status');
      searchParams.delete('payment_id');
      searchParams.delete('payment_type');
      searchParams.delete('merchant_order_id');
      searchParams.delete('preference_id');
      searchParams.delete('site_id');
      searchParams.delete('processing_mode');
      searchParams.delete('merchant_account_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  // Realtime: reload when config changes (e.g. admin updates beca limits)
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuraciones' }, () => {
        if (user) loadData();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ordenes' }, () => {
        if (user) loadData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function loadData() {
    const [profileRes, ordenesRes, becasRes, configRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('ordenes').select('*').eq('user_id', user!.id)
        .in('estado', ['pagado', 'en_proceso', 'finalizada', 'lista_retirar', 'retirada'])
        .order('created_at', { ascending: false }),
      supabase.from('becas').select('*').eq('user_id', user!.id).eq('estado', 'aprobada').maybeSingle(),
      supabase.from('configuraciones').select('*'),
    ]);
    setProfile(profileRes.data);
    setOrdenes(ordenesRes.data || []);
    setBecaActiva(becasRes.data || null);

    const cfgMap: Record<string, string> = {};
    configRes.data?.forEach((c: any) => { cfgMap[c.clave] = c.valor; });

    const limite = becasRes.data?.tipo === '100'
      ? Number(cfgMap.limite_beca_100 || 500)
      : Number(cfgMap.limite_beca_50 || 200);
    setLimiteBeca(limite);

    if (becasRes.data) {
      const now = new Date();
      const usoRes = await supabase.from('beca_uso_mensual').select('monto_usado')
        .eq('user_id', user!.id).eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()).maybeSingle();
      setBecaUso(Number(usoRes.data?.monto_usado || 0));
    }
  }

  const carillasDisponibles = Math.max(0, limiteBeca - becaUso);
  const usoPct = limiteBeca > 0 ? Math.min((becaUso / limiteBeca) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary"><Printer className="h-5 w-5 text-primary-foreground" /></div>
          <span className="text-xl font-bold">IMPRESIONES CEFyL</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Panel Admin</Button>}
          <span className="text-sm text-muted-foreground">{profile?.nombre_completo}</span>
          <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Confirmation banner after payment */}
        {showConfirmation && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 flex items-start gap-3 relative">
            <CheckCircle className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-primary">✅ ¡Tu pedido fue registrado con éxito!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tu pedido va a estar disponible dentro de <span className="font-bold text-foreground">24 a 48 horas hábiles</span>, dependiendo de nuestra demanda. Te vamos a avisar cuando esté listo para retirar.
              </p>
            </div>
            <button onClick={() => setShowConfirmation(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
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
              <CardTitle className="text-2xl">{becaActiva ? `${becaActiva.tipo}%` : 'Sin beca'}</CardTitle>
            </CardHeader>
          </Card>
          {becaActiva && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Carillas disponibles</CardDescription>
                <CardTitle className={`text-2xl ${carillasDisponibles < 50 ? 'text-destructive' : 'text-primary'}`}>
                  {carillasDisponibles}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Progress value={usoPct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Usaste {becaUso} de {limiteBeca} carillas
                </p>
                {carillasDisponibles < 50 && <p className="text-xs text-destructive">⚠️ Te quedan pocas carillas este mes</p>}
              </CardContent>
            </Card>
          )}
        </div>

        {/* "Usalo a conciencia" banner for beca users */}
        {becaActiva && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-primary">🌱 ¡Usá tu beca a conciencia!</p>
              <p className="text-xs text-muted-foreground">
                Tu beca es un recurso compartido. Imprimí solo lo necesario para cuidar el medio ambiente y que más compañeros puedan beneficiarse.
                {` Te quedan ${carillasDisponibles} carillas este mes.`}
              </p>
            </div>
          </div>
        )}

        {/* Beca info card */}
        {becaActiva && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Mi beca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/20 text-primary">Activa</Badge>
                <span className="font-medium">Beca del {becaActiva.tipo}%</span>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-muted">
                <div className="flex justify-between text-sm mb-1">
                  <span>Consumo mensual de carillas</span>
                  <span className="font-medium">{becaUso} / {limiteBeca}</span>
                </div>
                <Progress value={usoPct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Disponible: <span className={`font-bold ${carillasDisponibles < 50 ? 'text-destructive' : 'text-primary'}`}>{carillasDisponibles} carillas</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={() => navigate('/nueva-orden')} className="gap-2"><Plus className="h-4 w-4" /> Nueva impresión</Button>

        {/* Orders list */}
        <Card>
          <CardHeader><CardTitle>Historial de órdenes</CardTitle></CardHeader>
          <CardContent>
            {ordenes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tenés órdenes todavía.</p>
            ) : (
              <div className="space-y-3">
                {ordenes.map(o => (
                  <div key={o.id} className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow space-y-2">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.cantidad_paginas} carillas · {o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}
                          {o.color && ' · Color'}
                          {!o.doble_faz && ' · Simple faz'}
                          {o.anillado && ' · Anillado'}
                          {o.usar_beca && ' · 🎓 Beca'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Badge className={ESTADO_USUARIO_COLORS[o.estado_produccion] || 'bg-muted text-muted-foreground'}>
                        {ESTADO_USUARIO_LABELS[o.estado_produccion] || o.estado_produccion}
                      </Badge>
                    </div>
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
