import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, DollarSign, Settings, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador', pendiente_pago: 'Pendiente pago', pagado: 'Pagado',
  en_proceso: 'En proceso', finalizada: 'Finalizada', lista_retirar: 'Lista retirar',
  retirada: 'Retirada', cancelada: 'Cancelada',
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [searchDni, setSearchDni] = useState('');
  const [stats, setStats] = useState({ ordenesHoy: 0, ingresosHoy: 0, becasActivas: 0 });

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    const today = new Date().toISOString().split('T')[0];
    const [ordenesRes, usersRes, configRes, becasRes] = await Promise.all([
      supabase.from('ordenes').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('configuraciones').select('*'),
      supabase.from('becas').select('*').eq('estado', 'aprobada'),
    ]);
    const ords = ordenesRes.data || [];
    setOrdenes(ords);
    setUsuarios(usersRes.data || []);
    setConfig(configRes.data || []);

    const ordenesHoy = ords.filter((o: any) => o.created_at?.startsWith(today)).length;
    const ingresosHoy = ords.filter((o: any) => o.created_at?.startsWith(today) && o.estado !== 'cancelada')
      .reduce((sum: number, o: any) => sum + Number(o.monto_final || 0), 0);
    setStats({ ordenesHoy, ingresosHoy, becasActivas: becasRes.data?.length || 0 });
  }

  async function updateOrdenEstado(id: string, estado: string) {
    const { error } = await supabase.from('ordenes').update({ estado: estado as any }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Estado actualizado'); loadAll(); }
  }

  async function updateConfig(clave: string, valor: string) {
    const { error } = await supabase.from('configuraciones').update({ valor }).eq('clave', clave);
    if (error) toast.error(error.message);
    else toast.success('Configuración actualizada');
  }

  const filteredUsers = searchDni ? usuarios.filter((u: any) => u.dni?.includes(searchDni)) : usuarios;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-xl font-bold">Panel Administrativo</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Órdenes hoy</p><p className="text-2xl font-bold">{stats.ordenesHoy}</p></CardHeader></Card>
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Ingresos hoy</p><p className="text-2xl font-bold">${stats.ingresosHoy.toLocaleString('es-AR')}</p></CardHeader></Card>
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Becas activas</p><p className="text-2xl font-bold">{stats.becasActivas}</p></CardHeader></Card>
        </div>

        <Tabs defaultValue="ordenes">
          <TabsList>
            <TabsTrigger value="ordenes" className="gap-1"><FileText className="h-3.5 w-3.5" />Órdenes</TabsTrigger>
            <TabsTrigger value="usuarios" className="gap-1"><Users className="h-3.5 w-3.5" />Usuarios</TabsTrigger>
            <TabsTrigger value="config" className="gap-1"><Settings className="h-3.5 w-3.5" />Config</TabsTrigger>
          </TabsList>

          <TabsContent value="ordenes" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {ordenes.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">{o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}</p>
                      </div>
                      <Select value={o.estado} onValueChange={(v: string) => updateOrdenEstado(o.id, v)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ESTADO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {ordenes.length === 0 && <p className="text-center text-muted-foreground py-8">No hay órdenes</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="mt-4">
            <Card>
              <CardHeader>
                <Input placeholder="Buscar por DNI..." value={searchDni} onChange={e => setSearchDni(e.target.value)} className="max-w-xs" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{u.nombre_completo}</p>
                        <p className="text-xs text-muted-foreground">DNI: {u.dni} · {u.carrera}</p>
                      </div>
                      <Badge variant="outline">{u.email}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {config.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.descripcion || c.clave}</p>
                      <p className="text-xs text-muted-foreground">{c.clave}</p>
                    </div>
                    <Input className="w-32" defaultValue={c.valor} onBlur={e => updateConfig(c.clave, e.target.value)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
