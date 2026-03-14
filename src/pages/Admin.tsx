import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, DollarSign, Settings, GraduationCap, Download, History, Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador', pendiente_pago: 'Pendiente pago', pagado: 'Pagado',
  en_proceso: 'En proceso', finalizada: 'Finalizada', lista_retirar: 'Lista retirar',
  retirada: 'Retirada', cancelada: 'Cancelada',
};

export default function Admin() {
  const { isAdmin, session } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [becasActivas, setBecasActivas] = useState<any[]>([]);
  const [searchDni, setSearchDni] = useState('');
  const [stats, setStats] = useState({ ordenesHoy: 0, ingresosHoy: 0, becasActivas: 0, totalUsuarios: 0 });
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    const today = new Date().toISOString().split('T')[0];
    const [ordenesRes, usersRes, configRes, becasActRes] = await Promise.all([
      supabase.from('ordenes').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('configuraciones').select('*'),
      supabase.from('becas').select('*').eq('estado', 'aprobada'),
    ]);
    const ords = ordenesRes.data || [];
    setOrdenes(ords);
    setUsuarios(usersRes.data || []);
    setConfig(configRes.data || []);
    setBecasActivas(becasActRes.data || []);

    const ordenesHoy = ords.filter((o: any) => o.created_at?.startsWith(today)).length;
    const ingresosHoy = ords.filter((o: any) => o.created_at?.startsWith(today) && o.estado !== 'cancelada')
      .reduce((sum: number, o: any) => sum + Number(o.monto_final || 0), 0);
    setStats({ ordenesHoy, ingresosHoy, becasActivas: becasActRes.data?.length || 0, totalUsuarios: usersRes.data?.length || 0 });
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

  function getUserInfo(userId: string) {
    return usuarios.find((u: any) => u.user_id === userId);
  }
  function getUserName(userId: string) {
    const u = getUserInfo(userId);
    return u ? `${u.nombre_completo} (DNI: ${u.dni})` : userId;
  }

  // Excel upload for bulk user creation
  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (rows.length === 0) { toast.error('El Excel está vacío'); setUploading(false); return; }

      // Map columns - try to find them flexibly
      const users = rows.map(row => {
        const keys = Object.keys(row);
        const findCol = (patterns: string[]) => {
          for (const p of patterns) {
            const found = keys.find(k => k.toLowerCase().replace(/[^a-záéíóú]/g, '').includes(p));
            if (found) return row[found];
          }
          return '';
        };

        return {
          dni: (findCol(['dni', 'documento']) || '').toString().trim(),
          email: (findCol(['correo', 'email', 'mail']) || '').toString().trim().toLowerCase(),
          apellido: (findCol(['apellido']) || '').toString().trim(),
          nombre: (findCol(['nombre']) || '').toString().trim(),
          carrera: (findCol(['carrera']) || '').toString().trim(),
          porcentaje_beca: (findCol(['porcentaje', 'beca', '%beca']) || '0').toString().trim(),
        };
      }).filter(u => u.dni && u.email);

      if (users.length === 0) {
        toast.error('No se encontraron filas válidas. Verificá las columnas: DNI, CORREO ELECTRONICO, APELLIDO, NOMBRE, CARRERA, PORCENTAJE DE BECA');
        setUploading(false);
        return;
      }

      // Call edge function
      const { data: result, error } = await supabase.functions.invoke('bulk-create-users', {
        body: { users },
      });

      if (error) {
        toast.error('Error al procesar: ' + error.message);
      } else if (result) {
        toast.success(`✅ ${result.created} usuarios creados, ${result.skipped} omitidos (ya existían)`);
        if (result.errors?.length > 0) {
          console.warn('Errores:', result.errors);
          toast.warning(`${result.errors.length} errores. Revisá la consola.`);
        }
        loadAll();
      }
    } catch (err: any) {
      toast.error('Error leyendo el archivo: ' + err.message);
    }

    setUploading(false);
    e.target.value = '';
  }

  // Delete all non-admin users and their data
  async function handleDeleteAll() {
    setDeleting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('bulk-create-users', {
        body: { action: 'delete_all' },
      });

      if (error) {
        toast.error('Error: ' + error.message);
      } else if (result) {
        toast.success(`🗑️ ${result.deleted} usuarios eliminados`);
        loadAll();
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
    setDeleting(false);
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
    const wbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbook, ws, 'Balance');
    const totalIngresos = rows.reduce((s, r) => s + r['Monto Final'], 0);
    const totalDescuentos = rows.reduce((s, r) => s + r['Descuento Beca'], 0);
    const summaryData = [
      { Concepto: 'Total órdenes', Valor: rows.length },
      { Concepto: 'Total ingresos', Valor: totalIngresos },
      { Concepto: 'Total descuentos becas', Valor: totalDescuentos },
      { Concepto: 'Ingresos netos', Valor: totalIngresos },
    ];
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wbook, ws2, 'Resumen');
    XLSX.writeFile(wbook, `balance_cefyl_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel descargado');
  }

  const filteredOrdenes = ordenes.filter(o => {
    if (fechaDesde && o.created_at < fechaDesde) return false;
    if (fechaHasta && o.created_at > fechaHasta + 'T23:59:59') return false;
    return true;
  });

  const filteredUsers = searchDni ? usuarios.filter((u: any) => u.dni?.includes(searchDni)) : usuarios;

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
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" />Usuarios</p><p className="text-2xl font-bold">{stats.totalUsuarios}</p></CardHeader></Card>
        </div>

        {/* Excel Upload & Data Management */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" /> Carga masiva de usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subí un Excel con las columnas: <span className="font-medium">DNI, CORREO ELECTRONICO, APELLIDO, NOMBRE, CARRERA, PORCENTAJE DE BECA</span>.
              El DNI se usará como contraseña. La beca se asigna automáticamente.
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="cursor-pointer">
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} disabled={uploading} />
                <Button asChild variant="default" disabled={uploading} className="gap-2">
                  <span>{uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : <><Upload className="h-4 w-4" /> Cargar Excel</>}</span>
                </Button>
              </label>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={deleting}>
                    <Trash2 className="h-4 w-4" /> Borrar todos los usuarios
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ ¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esto eliminará TODOS los usuarios (excepto administradores), sus órdenes, becas y datos asociados. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {deleting ? 'Eliminando...' : 'Sí, borrar todo'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ordenes">
          <TabsList>
            <TabsTrigger value="ordenes" className="gap-1"><FileText className="h-3.5 w-3.5" />Órdenes</TabsTrigger>
            <TabsTrigger value="historial" className="gap-1"><History className="h-3.5 w-3.5" />Historial</TabsTrigger>
            <TabsTrigger value="becas" className="gap-1"><GraduationCap className="h-3.5 w-3.5" />Becas</TabsTrigger>
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

          {/* Becas tab - now read-only, assigned from Excel */}
          <TabsContent value="becas" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Becas activas (asignadas por Excel)</CardTitle></CardHeader>
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
                        <Badge className="bg-primary/20 text-primary">{b.tipo}%</Badge>
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
                  {filteredUsers.map((u: any) => {
                    const beca = becasActivas.find((b: any) => b.user_id === u.user_id);
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{u.nombre_completo}</p>
                          <p className="text-xs text-muted-foreground">DNI: {u.dni} · {u.carrera} · {u.email}</p>
                        </div>
                        {beca && <Badge className="bg-primary/20 text-primary">Beca {beca.tipo}%</Badge>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config tab */}
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
