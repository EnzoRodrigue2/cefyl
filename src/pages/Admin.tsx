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
import { ArrowLeft, Users, FileText, DollarSign, Settings, GraduationCap, X, Download, History } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  const [becasPendientes, setBecasPendientes] = useState<any[]>([]);
  const [becasActivas, setBecasActivas] = useState<any[]>([]);
  const [searchDni, setSearchDni] = useState('');
  const [stats, setStats] = useState({ ordenesHoy: 0, ingresosHoy: 0, becasActivas: 0, becasPendientes: 0 });
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    const today = new Date().toISOString().split('T')[0];
    const [ordenesRes, usersRes, configRes, becasPendRes, becasActRes] = await Promise.all([
      supabase.from('ordenes').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('configuraciones').select('*'),
      supabase.from('becas').select('*').eq('estado', 'pendiente').order('created_at', { ascending: true }),
      supabase.from('becas').select('*').eq('estado', 'aprobada'),
    ]);
    const ords = ordenesRes.data || [];
    setOrdenes(ords);
    setUsuarios(usersRes.data || []);
    setConfig(configRes.data || []);
    setBecasPendientes(becasPendRes.data || []);
    setBecasActivas(becasActRes.data || []);

    const ordenesHoy = ords.filter((o: any) => o.created_at?.startsWith(today)).length;
    const ingresosHoy = ords.filter((o: any) => o.created_at?.startsWith(today) && o.estado !== 'cancelada')
      .reduce((sum: number, o: any) => sum + Number(o.monto_final || 0), 0);
    setStats({ ordenesHoy, ingresosHoy, becasActivas: becasActRes.data?.length || 0, becasPendientes: becasPendRes.data?.length || 0 });
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

  async function aprobarBeca(becaId: string, tipo: string) {
    const { error } = await supabase.from('becas').update({
      estado: 'aprobada' as any, tipo: tipo as any, fecha_inicio: new Date().toISOString().split('T')[0],
    }).eq('id', becaId);
    if (error) toast.error(error.message);
    else { toast.success(`Beca ${tipo}% aprobada`); loadAll(); }
  }

  async function rechazarBeca(becaId: string) {
    const { error } = await supabase.from('becas').update({
      estado: 'rechazada' as any, motivo_revocacion: 'Solicitud rechazada por el administrador',
    }).eq('id', becaId);
    if (error) toast.error(error.message);
    else { toast.success('Beca rechazada'); loadAll(); }
  }

  async function revocarBeca(becaId: string) {
    const { error } = await supabase.from('becas').update({
      estado: 'revocada' as any, motivo_revocacion: 'Revocada por el administrador',
    }).eq('id', becaId);
    if (error) toast.error(error.message);
    else { toast.success('Beca revocada'); loadAll(); }
  }

  function getUserInfo(userId: string) {
    return usuarios.find((u: any) => u.user_id === userId);
  }
  function getUserName(userId: string) {
    const u = getUserInfo(userId);
    return u ? `${u.nombre_completo} (DNI: ${u.dni})` : userId;
  }

  // Excel export
  function exportBalanceExcel() {
    const rows = ordenes.filter(o => o.estado !== 'cancelada').map(o => {
      const u = getUserInfo(o.user_id);
      return {
        Fecha: new Date(o.created_at).toLocaleString('es-AR'),
        Usuario: u?.nombre_completo || '',
        DNI: u?.dni || '',
        Carrera: u?.carrera || '',
        Archivo: o.archivo_nombre,
        Hojas: o.cantidad_hojas,
        'Doble Faz': o.doble_faz ? 'Sí' : 'No',
        Color: o.color ? 'Sí' : 'No',
        Anillado: o.anillado ? 'Sí' : 'No',
        'Usó Beca': o.usar_beca ? 'Sí' : 'No',
        'Precio Base': Number(o.precio_base),
        'Descuento Beca': Number(o.descuento_beca || 0),
        'Monto Final': Number(o.monto_final),
        Estado: ESTADO_LABELS[o.estado] || o.estado,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance');

    // Summary sheet
    const totalIngresos = rows.reduce((s, r) => s + r['Monto Final'], 0);
    const totalDescuentos = rows.reduce((s, r) => s + r['Descuento Beca'], 0);
    const summaryData = [
      { Concepto: 'Total órdenes', Valor: rows.length },
      { Concepto: 'Total ingresos', Valor: totalIngresos },
      { Concepto: 'Total descuentos becas', Valor: totalDescuentos },
      { Concepto: 'Ingresos netos', Valor: totalIngresos },
    ];
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    XLSX.writeFile(wb, `balance_cefyl_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel descargado');
  }

  // Filter orders by date for history
  const filteredOrdenes = ordenes.filter(o => {
    if (fechaDesde && o.created_at < fechaDesde) return false;
    if (fechaHasta && o.created_at > fechaHasta + 'T23:59:59') return false;
    return true;
  });

  const filteredUsers = searchDni ? usuarios.filter((u: any) => u.dni?.includes(searchDni)) : usuarios;

  // Config grouping for display
  const PRICING_KEYS = ['precio_simple_faz', 'precio_doble_faz', 'precio_color', 'anillado_1_50', 'anillado_51_100', 'anillado_101_plus', 'precio_por_hoja', 'limite_beca_100'];
  const pricingConfig = config.filter(c => PRICING_KEYS.includes(c.clave));
  const otherConfig = config.filter(c => !PRICING_KEYS.includes(c.clave));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-xl font-bold">Panel Admin — IMPRESIONES CEFyL</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Órdenes hoy</p><p className="text-2xl font-bold">{stats.ordenesHoy}</p></CardHeader></Card>
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Ingresos hoy</p><p className="text-2xl font-bold">${stats.ingresosHoy.toLocaleString('es-AR')}</p></CardHeader></Card>
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Becas activas</p><p className="text-2xl font-bold">{stats.becasActivas}</p></CardHeader></Card>
          <Card className={stats.becasPendientes > 0 ? 'border-warning' : ''}>
            <CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Becas pendientes</p><p className="text-2xl font-bold">{stats.becasPendientes}</p></CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="ordenes">
          <TabsList>
            <TabsTrigger value="ordenes" className="gap-1"><FileText className="h-3.5 w-3.5" />Órdenes</TabsTrigger>
            <TabsTrigger value="historial" className="gap-1"><History className="h-3.5 w-3.5" />Historial</TabsTrigger>
            <TabsTrigger value="becas" className="gap-1">
              <GraduationCap className="h-3.5 w-3.5" />Becas
              {stats.becasPendientes > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{stats.becasPendientes}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="gap-1"><Users className="h-3.5 w-3.5" />Usuarios</TabsTrigger>
            <TabsTrigger value="config" className="gap-1"><Settings className="h-3.5 w-3.5" />Precios y Config</TabsTrigger>
          </TabsList>

          {/* Ordenes tab */}
          <TabsContent value="ordenes" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Órdenes recientes</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={exportBalanceExcel}>
                  <Download className="h-4 w-4" /> Descargar Excel
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ordenes.slice(0, 50).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {getUserName(o.user_id)} · {o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}
                          {o.color && ' · Color'}{o.anillado && ' · Anillado'}{o.usar_beca && ' · 🎓'}
                        </p>
                      </div>
                      <Select value={o.estado} onValueChange={(v) => updateOrdenEstado(o.id, v)}>
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

          {/* Historial tab */}
          <TabsContent value="historial" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de impresiones</CardTitle>
                <div className="flex gap-3 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Desde</label>
                    <Input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} className="w-40" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Hasta</label>
                    <Input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} className="w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Fecha y hora</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Usuario</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">DNI</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Carrera</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Archivo</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Hojas</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Opciones</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Monto</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdenes.map(o => {
                        const u = getUserInfo(o.user_id);
                        return (
                          <tr key={o.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 whitespace-nowrap">{new Date(o.created_at).toLocaleString('es-AR')}</td>
                            <td className="py-2 px-2">{u?.nombre_completo || '—'}</td>
                            <td className="py-2 px-2">{u?.dni || '—'}</td>
                            <td className="py-2 px-2">{u?.carrera || '—'}</td>
                            <td className="py-2 px-2 max-w-32 truncate">{o.archivo_nombre}</td>
                            <td className="py-2 px-2 text-right">{o.cantidad_hojas}</td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                {o.doble_faz && <Badge variant="outline" className="text-xs">2F</Badge>}
                                {o.color && <Badge variant="outline" className="text-xs">Color</Badge>}
                                {o.anillado && <Badge variant="outline" className="text-xs">Anil.</Badge>}
                                {o.usar_beca && <Badge variant="outline" className="text-xs">🎓</Badge>}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right font-medium">${Number(o.monto_final).toLocaleString('es-AR')}</td>
                            <td className="py-2 px-2">{ESTADO_LABELS[o.estado] || o.estado}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredOrdenes.length === 0 && <p className="text-center text-muted-foreground py-8">No hay órdenes en el rango seleccionado</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Becas tab */}
          <TabsContent value="becas" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Solicitudes pendientes</CardTitle></CardHeader>
              <CardContent>
                {becasPendientes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay solicitudes pendientes</p>
                ) : (
                  <div className="space-y-3">
                    {becasPendientes.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-4 rounded-lg border bg-warning/5">
                        <div>
                          <p className="font-medium">{getUserName(b.user_id)}</p>
                          <p className="text-xs text-muted-foreground">Solicitó: <span className="font-medium">{b.tipo}%</span> · {new Date(b.created_at).toLocaleDateString('es-AR')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(tipo) => aprobarBeca(b.id, tipo)}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Aprobar como..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">Aprobar 50%</SelectItem>
                              <SelectItem value="100">Aprobar 100%</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="destructive" size="icon" onClick={() => rechazarBeca(b.id)} title="Rechazar"><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Becas activas</CardTitle></CardHeader>
              <CardContent>
                {becasActivas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay becas activas</p>
                ) : (
                  <div className="space-y-2">
                    {becasActivas.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{getUserName(b.user_id)}</p>
                          <p className="text-xs text-muted-foreground">Beca {b.tipo}% · Desde: {b.fecha_inicio ? new Date(b.fecha_inicio).toLocaleDateString('es-AR') : '—'}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => revocarBeca(b.id)}>Revocar</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuarios tab */}
          <TabsContent value="usuarios" className="mt-4">
            <Card>
              <CardHeader><Input placeholder="Buscar por DNI..." value={searchDni} onChange={e => setSearchDni(e.target.value)} className="max-w-xs" /></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{u.nombre_completo}</p>
                        <p className="text-xs text-muted-foreground">DNI: {u.dni} · {u.carrera} · {u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config tab - Precios y Config */}
          <TabsContent value="config" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">💰 Precios de impresión</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pricingConfig.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.descripcion || c.clave}</p>
                      <p className="text-xs text-muted-foreground">{c.clave}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input className="w-28" defaultValue={c.valor} onBlur={e => updateConfig(c.clave, e.target.value)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {otherConfig.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">⚙️ Otras configuraciones</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {otherConfig.map((c: any) => (
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
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
