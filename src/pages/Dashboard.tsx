import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Printer, FileText, Clock, GraduationCap, Plus, LogOut, Send, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  borrador: 'Borrador', pendiente_pago: 'Pendiente de pago', pagado: 'Pagado',
  en_proceso: 'En proceso', finalizada: 'Finalizada', lista_retirar: 'Lista para retirar',
  retirada: 'Retirada', cancelada: 'Cancelada',
};

const BECA_ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-warning/20 text-warning', aprobada: 'bg-success/20 text-success',
  rechazada: 'bg-destructive/20 text-destructive', revocada: 'bg-muted text-muted-foreground',
};
const BECA_ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada', revocada: 'Revocada',
};

export default function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [becaActiva, setBecaActiva] = useState<any>(null);
  const [becaUso, setBecaUso] = useState(0);
  const [limiteBeca, setLimiteBeca] = useState(5000);
  const [solicitandoBeca, setSolicitandoBeca] = useState(false);
  const [becaTipoSolicitada, setBecaTipoSolicitada] = useState<'50' | '100'>('50');
  const [mostrarFormBeca, setMostrarFormBeca] = useState(false);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function loadData() {
    const [profileRes, ordenesRes, becasRes, configRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user!.id).single(),
      supabase.from('ordenes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('becas').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('configuraciones').select('*'),
    ]);
    setProfile(profileRes.data);
    setOrdenes(ordenesRes.data || []);
    const allBecas = becasRes.data || [];
    setBecas(allBecas);
    const activa = allBecas.find((b: any) => b.estado === 'aprobada');
    setBecaActiva(activa || null);

    const cfgMap: Record<string, string> = {};
    configRes.data?.forEach((c: any) => { cfgMap[c.clave] = c.valor; });
    const limite = Number(cfgMap.limite_beca_100 || 5000);
    setLimiteBeca(limite);

    if (activa?.tipo === '100') {
      const now = new Date();
      const usoRes = await supabase.from('beca_uso_mensual').select('monto_usado')
        .eq('user_id', user!.id).eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()).maybeSingle();
      setBecaUso(Number(usoRes.data?.monto_usado || 0));
    }
  }

  async function solicitarBeca() {
    if (!user) return;
    if (becas.find((b: any) => b.estado === 'pendiente')) { toast.error('Ya tenés una solicitud pendiente'); return; }
    if (becaActiva) { toast.error('Ya tenés una beca activa'); return; }
    setSolicitandoBeca(true);
    const { error } = await supabase.from('becas').insert({ user_id: user.id, tipo: becaTipoSolicitada, estado: 'pendiente' });
    if (error) toast.error('Error: ' + error.message);
    else { toast.success(`Solicitud de beca del ${becaTipoSolicitada}% enviada`); setMostrarFormBeca(false); loadData(); }
    setSolicitandoBeca(false);
  }

  const saldoDisponible = limiteBeca - becaUso;
  const usoPct = limiteBeca > 0 ? Math.min((becaUso / limiteBeca) * 100, 100) : 0;
  const tieneSolicitudPendiente = becas.some((b: any) => b.estado === 'pendiente');
  const solicitudPendiente = becas.find((b: any) => b.estado === 'pendiente');

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
          {becaActiva?.tipo === '100' && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Saldo beca mensual</CardDescription>
                <CardTitle className={`text-2xl ${saldoDisponible < 1000 ? 'text-destructive' : 'text-primary'}`}>
                  ${saldoDisponible.toLocaleString('es-AR')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Progress value={usoPct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Usaste ${becaUso.toLocaleString('es-AR')} de ${limiteBeca.toLocaleString('es-AR')}
                </p>
                {saldoDisponible < 1000 && <p className="text-xs text-destructive">⚠️ Te queda poco saldo este mes</p>}
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
                {becaActiva.tipo === '100' && ` Te quedan $${saldoDisponible.toLocaleString('es-AR')} este mes.`}
              </p>
            </div>
          </div>
        )}

        {/* Scholarship section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Mi beca</CardTitle>
          </CardHeader>
          <CardContent>
            {becaActiva ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-success/20 text-success">Aprobada</Badge>
                  <span className="font-medium">Beca del {becaActiva.tipo}%</span>
                  {becaActiva.fecha_vencimiento && (
                    <span className="text-sm text-muted-foreground">· Vence: {new Date(becaActiva.fecha_vencimiento).toLocaleDateString('es-AR')}</span>
                  )}
                </div>
                {becaActiva.tipo === '50' && (
                  <p className="text-sm text-muted-foreground">Tenés un 50% de descuento en todas tus impresiones.</p>
                )}
                {becaActiva.tipo === '100' && (
                  <div className="mt-2 p-3 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consumo mensual</span>
                      <span className="font-medium">${becaUso.toLocaleString('es-AR')} / ${limiteBeca.toLocaleString('es-AR')}</span>
                    </div>
                    <Progress value={usoPct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Disponible: <span className={`font-bold ${saldoDisponible < 1000 ? 'text-destructive' : 'text-primary'}`}>${saldoDisponible.toLocaleString('es-AR')}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : tieneSolicitudPendiente ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-warning/20 text-warning">Pendiente</Badge>
                <span className="text-sm text-muted-foreground">
                  Tu solicitud de beca del {solicitudPendiente?.tipo}% está siendo evaluada.
                </span>
              </div>
            ) : mostrarFormBeca ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Seleccioná el tipo de beca:</p>
                <RadioGroup value={becaTipoSolicitada} onValueChange={(v) => setBecaTipoSolicitada(v as '50' | '100')} className="flex gap-6">
                  <div className="flex items-center gap-2"><RadioGroupItem value="50" id="beca-50" /><Label htmlFor="beca-50" className="cursor-pointer">Beca del 50%</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="100" id="beca-100" /><Label htmlFor="beca-100" className="cursor-pointer">Beca del 100%</Label></div>
                </RadioGroup>
                <div className="flex gap-2">
                  <Button onClick={solicitarBeca} disabled={solicitandoBeca} variant="secondary" className="gap-2">
                    <Send className="h-4 w-4" /> {solicitandoBeca ? 'Enviando...' : 'Enviar solicitud'}
                  </Button>
                  <Button variant="ghost" onClick={() => setMostrarFormBeca(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">No tenés beca activa.</p>
                <Button onClick={() => setMostrarFormBeca(true)} variant="secondary" className="gap-2">
                  <Send className="h-4 w-4" /> Solicitar beca
                </Button>
              </div>
            )}

            {becas.length > 1 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Historial</p>
                {becas.filter(b => b.id !== becaActiva?.id).map((b: any) => (
                  <div key={b.id} className="flex items-center gap-2 text-sm">
                    <Badge className={BECA_ESTADO_COLORS[b.estado] || ''}>{BECA_ESTADO_LABELS[b.estado]}</Badge>
                    <span>{b.tipo !== 'sin_beca' ? `${b.tipo}%` : '—'}</span>
                    <span className="text-muted-foreground">· {new Date(b.created_at).toLocaleDateString('es-AR')}</span>
                    {b.motivo_revocacion && <span className="text-xs text-destructive">({b.motivo_revocacion})</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}
                          {o.color && ' · Color'}
                          {o.doble_faz && ' · Doble faz'}
                          {o.anillado && ' · Anillado'}
                          {o.usar_beca && ' · 🎓 Beca'}
                        </p>
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
