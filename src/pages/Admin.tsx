import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, DollarSign, Settings, GraduationCap, Download, History, Upload, Trash2, Loader2, Minus, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador', pendiente_pago: 'Pendiente pago', pagado: 'Pagado',
  en_proceso: 'En proceso', finalizada: 'Finalizada', lista_retirar: 'Lista retirar',
  retirada: 'Retirada', cancelada: 'Cancelada',
};

const PRODUCCION_LABELS: Record<string, string> = {
  para_hacer: 'Para hacer',
  hecho: 'Hecho',
  retirado: 'Retirado',
};

const PRODUCCION_BADGE_COLORS: Record<string, string> = {
  para_hacer: 'bg-yellow-500/20 text-yellow-700',
  hecho: 'bg-green-500/20 text-green-700',
  retirado: 'bg-blue-500/20 text-blue-700',
};

// Only show paid orders in admin (exclude borrador, pendiente_pago, cancelada)
const ESTADOS_VISIBLES = ['pagado', 'en_proceso', 'finalizada', 'lista_retirar', 'retirada'];

export default function Admin() {
  const { isAdmin, session } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [becasActivas, setBecasActivas] = useState<any[]>([]);
  const [becaUsos, setBecaUsos] = useState<any[]>([]);
  const [searchDni, setSearchDni] = useState('');
  const [stats, setStats] = useState({ ordenesHoy: 0, ingresosHoy: 0, becasActivas: 0, totalUsuarios: 0 });
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Manual deduction state
  const [deductUserId, setDeductUserId] = useState('');
  const [deductCarillas, setDeductCarillas] = useState('');
  const [deducting, setDeducting] = useState(false);

  // DNI search for manual deduction
  const [dniSearch, setDniSearch] = useState('');
  const [dniSearchResult, setDniSearchResult] = useState<any | null>(null);
  const [dniSearching, setDniSearching] = useState(false);
  const [dniDeductCarillas, setDniDeductCarillas] = useState('');
  const [dniDeducting, setDniDeducting] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const [ordenesRes, usersRes, configRes, becasActRes, usoRes] = await Promise.all([
      supabase.from('ordenes').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('configuraciones').select('*'),
      supabase.from('becas').select('*').eq('estado', 'aprobada'),
      supabase.from('beca_uso_mensual').select('*').eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()),
    ]);
    const ords = ordenesRes.data || [];
    setOrdenes(ords);
    setUsuarios(usersRes.data || []);
    setConfig(configRes.data || []);
    setBecasActivas(becasActRes.data || []);
    setBecaUsos(usoRes.data || []);

    // Stats only count paid orders
    const paidOrds = ords.filter((o: any) => ESTADOS_VISIBLES.includes(o.estado));
    const ordenesHoy = paidOrds.filter((o: any) => o.created_at?.startsWith(today)).length;
    const ingresosHoy = paidOrds.filter((o: any) => o.created_at?.startsWith(today))
      .reduce((sum: number, o: any) => sum + Number(o.monto_final || 0), 0);
    setStats({ ordenesHoy, ingresosHoy, becasActivas: becasActRes.data?.length || 0, totalUsuarios: usersRes.data?.length || 0 });
  }

  async function updateEstadoProduccion(id: string, estado: string) {
    const { error } = await supabase.from('ordenes').update({ estado_produccion: estado as any }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Estado de producción actualizado'); loadAll(); }
  }

  async function deleteOrden(id: string, archivoUrl: string) {
    try {
      await Promise.all([
        supabase.from('turnos').delete().eq('orden_id', id),
        supabase.from('pagos').delete().eq('orden_id', id),
        supabase.from('movimientos_financieros').delete().eq('orden_id', id),
      ]);
      if (archivoUrl) {
        await supabase.storage.from('print-files').remove([archivoUrl]);
      }
      const { error } = await supabase.from('ordenes').delete().eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success('Orden eliminada');
      loadAll();
    } catch (err: any) {
      toast.error('Error eliminando orden: ' + err.message);
    }
  }

  async function updateConfig(clave: string, valor: string) {
    const { error } = await supabase.from('configuraciones').update({ valor }).eq('clave', clave);
    if (error) toast.error(error.message);
    else toast.success('Configuración actualizada');
  }

  async function handleDownloadFile(archivoUrl: string, archivoNombre: string) {
    try {
      const { data, error } = await supabase.storage.from('print-files').download(archivoUrl);
      if (error) { toast.error('Error descargando archivo: ' + error.message); return; }
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = archivoNombre;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Archivo descargado');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  }

  function getUserInfo(userId: string) {
    return usuarios.find((u: any) => u.user_id === userId);
  }
  function getUserName(userId: string) {
    const u = getUserInfo(userId);
    return u ? `${u.nombre_completo} (DNI: ${u.dni})` : userId;
  }
  function getUserUso(userId: string) {
    const uso = becaUsos.find((u: any) => u.user_id === userId);
    return Number(uso?.monto_usado || 0);
  }

  // Manual carilla deduction by selector
  async function handleDeductCarillas() {
    if (!deductUserId || !deductCarillas || Number(deductCarillas) <= 0) {
      toast.error('Seleccioná un usuario e ingresá la cantidad de carillas');
      return;
    }
    setDeducting(true);
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();
      const cantidad = Number(deductCarillas);

      const { data: existing } = await supabase.from('beca_uso_mensual')
        .select('*').eq('user_id', deductUserId).eq('mes', mes).eq('anio', anio).maybeSingle();

      if (existing) {
        await supabase.from('beca_uso_mensual').update({
          monto_usado: Number(existing.monto_usado || 0) + cantidad
        }).eq('id', existing.id);
      } else {
        await supabase.from('beca_uso_mensual').insert({
          user_id: deductUserId, mes, anio, monto_usado: cantidad
        });
      }

      toast.success(`✅ ${cantidad} carillas descontadas`);
      setDeductCarillas('');
      setDeductUserId('');
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
    setDeducting(false);
  }

  // DNI search for manual deduction
  async function handleDniSearch() {
    const dni = dniSearch.trim();
    if (!dni || !/^\d+$/.test(dni)) {
      toast.error('Ingresá un DNI numérico válido');
      return;
    }
    setDniSearching(true);
    setDniSearchResult(null);

    const { data: profile } = await supabase.from('profiles').select('*').eq('dni', dni).maybeSingle();
    if (!profile) {
      toast.error('No se encontró un usuario con ese DNI');
      setDniSearching(false);
      return;
    }

    const beca = becasActivas.find((b: any) => b.user_id === profile.user_id);
    const uso = getUserUso(profile.user_id);
    const cfgMap: Record<string, number> = {};
    config.forEach((c: any) => { cfgMap[c.clave] = Number(c.valor); });
    const limite = beca ? (beca.tipo === '100' ? (cfgMap.limite_beca_100 || 500) : (cfgMap.limite_beca_50 || 200)) : 0;
    const disponible = Math.max(0, limite - uso);

    setDniSearchResult({ ...profile, beca, uso, limite, disponible });
    setDniSearching(false);
  }

  async function handleDniDeduct() {
    if (!dniSearchResult || !dniDeductCarillas || Number(dniDeductCarillas) <= 0) {
      toast.error('Ingresá la cantidad de carillas a descontar');
      return;
    }
    const cantidad = Number(dniDeductCarillas);
    if (cantidad > dniSearchResult.disponible) {
      toast.error(`No se puede descontar ${cantidad} carillas. Disponible: ${dniSearchResult.disponible}`);
      return;
    }
    setDniDeducting(true);
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      const { data: existing } = await supabase.from('beca_uso_mensual')
        .select('*').eq('user_id', dniSearchResult.user_id).eq('mes', mes).eq('anio', anio).maybeSingle();

      if (existing) {
        await supabase.from('beca_uso_mensual').update({
          monto_usado: Number(existing.monto_usado || 0) + cantidad
        }).eq('id', existing.id);
      } else {
        await supabase.from('beca_uso_mensual').insert({
          user_id: dniSearchResult.user_id, mes, anio, monto_usado: cantidad
        });
      }

      toast.success(`✅ ${cantidad} carillas descontadas a ${dniSearchResult.nombre_completo}`);
      setDniDeductCarillas('');
      setDniSearchResult(null);
      setDniSearch('');
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
    setDniDeducting(false);
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

      const users = rows.map(row => {
        const keys = Object.keys(row);
        const findCol = (patterns: string[]) => {
          for (const p of patterns) {
            const found = keys.find(k => k.toLowerCase().replace(/[^a-záéíóú]/g, '').includes(p));
            if (found) return row[found];
          }
          return '';
        };

        // Parse beca percentage: Excel may have 0.5, 1, "50%", "100%", 50, 100
        const rawBeca = (findCol(['porcentaje', 'beca', '%beca']) || '0').toString().trim().replace(/%/g, '');
        let becaPct = parseFloat(rawBeca) || 0;
        if (becaPct > 0 && becaPct <= 1) becaPct = Math.round(becaPct * 100); // 0.5 → 50, 1 → 100

        return {
          dni: (findCol(['dni', 'documento']) || '').toString().trim(),
          email: (findCol(['correo', 'email', 'mail']) || '').toString().trim().toLowerCase(),
          apellido: (findCol(['apellido']) || '').toString().trim(),
          nombre: (findCol(['nombre']) || '').toString().trim(),
          carrera: (findCol(['carrera']) || '').toString().trim(),
          porcentaje_beca: becaPct.toString(),
        };
      }).filter(u => u.dni && u.email);

      if (users.length === 0) {
        toast.error('No se encontraron filas válidas. Verificá las columnas: DNI, CORREO ELECTRONICO, APELLIDO, NOMBRE, CARRERA, PORCENTAJE DE BECA');
        setUploading(false);
        return;
      }

      // Send in batches of 50 to avoid edge function timeout
      const BATCH_SIZE = 50;
      let totalCreated = 0, totalSkipped = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        toast.info(`Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(users.length / BATCH_SIZE)}...`);
        
        const { data: result, error } = await supabase.functions.invoke('bulk-create-users', {
          body: { users: batch },
        });

        if (error) {
          allErrors.push(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
          continue;
        }
        if (result) {
          totalCreated += result.created || 0;
          totalSkipped += result.skipped || 0;
          if (result.errors?.length) allErrors.push(...result.errors);
        }
      }

      toast.success(`✅ ${totalCreated} usuarios creados, ${totalSkipped} omitidos (ya existían)`);
      if (allErrors.length > 0) {
        console.warn('Errores:', allErrors);
        toast.warning(`${allErrors.length} errores. Revisá la consola.`);
      }
      loadAll();
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
    const paidOrds = ordenes.filter(o => ESTADOS_VISIBLES.includes(o.estado));
    const rows = paidOrds.map(o => {
      const u = getUserInfo(o.user_id);
      return {
        Fecha: new Date(o.created_at).toLocaleString('es-AR'),
        Usuario: u?.nombre_completo || '',
        DNI: u?.dni || '',
        Carrera: u?.carrera || '',
        Archivo: o.archivo_nombre,
        Carillas: o.cantidad_paginas,
        Hojas: o.cantidad_hojas,
        'Doble Faz': o.doble_faz ? 'Sí' : 'No',
        Color: o.color ? 'Sí' : 'No',
        Anillado: o.anillado ? 'Sí' : 'No',
        'Usó Beca': o.usar_beca ? 'Sí' : 'No',
        'Precio Base': Number(o.precio_base),
        'Descuento Beca': Number(o.descuento_beca || 0),
        'Monto Final': Number(o.monto_final),
        Estado: ESTADO_LABELS[o.estado] || o.estado,
        'Estado Producción': PRODUCCION_LABELS[o.estado_produccion] || o.estado_produccion || 'Para hacer',
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

  // Only show paid orders
  const visibleOrdenes = ordenes.filter(o => ESTADOS_VISIBLES.includes(o.estado));

  const filteredOrdenes = visibleOrdenes.filter(o => {
    if (fechaDesde && o.created_at < fechaDesde) return false;
    if (fechaHasta && o.created_at > fechaHasta + 'T23:59:59') return false;
    return true;
  });

  const filteredUsers = searchDni ? usuarios.filter((u: any) => u.dni?.includes(searchDni)) : usuarios;

  const PRICING_KEYS = ['precio_simple_faz', 'precio_doble_faz', 'precio_color', 'anillado_1_50', 'anillado_51_100', 'anillado_101_plus', 'limite_beca_50', 'limite_beca_100'];
  const pricingConfig = config.filter(c => PRICING_KEYS.includes(c.clave));
  const otherConfig = config.filter(c => !PRICING_KEYS.includes(c.clave));

  // Users with active beca for the deduction selector
  const becaUsers = becasActivas.map(b => {
    const u = getUserInfo(b.user_id);
    const uso = getUserUso(b.user_id);
    const cfgMap: Record<string, number> = {};
    config.forEach((c: any) => { cfgMap[c.clave] = Number(c.valor); });
    const limite = b.tipo === '100' ? (cfgMap.limite_beca_100 || 500) : (cfgMap.limite_beca_50 || 200);
    return { ...b, nombre: u?.nombre_completo || '', dni: u?.dni || '', uso, limite, disponible: Math.max(0, limite - uso) };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-xl font-bold">Panel Admin — IMPRESIONES CEFyL</h1>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Órdenes hoy (pagadas)</p><p className="text-2xl font-bold">{stats.ordenesHoy}</p></CardHeader></Card>
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

          {/* Ordenes tab - only paid orders */}
          <TabsContent value="ordenes" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Órdenes pagadas</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={exportBalanceExcel}>
                  <Download className="h-4 w-4" /> Descargar Excel
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {visibleOrdenes.slice(0, 50).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{o.archivo_nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {getUserName(o.user_id)} · {o.cantidad_paginas} carillas · {o.cantidad_hojas} hojas · ${Number(o.monto_final).toLocaleString('es-AR')}
                          {o.color && ' · Color'}{o.anillado && ' · Anillado'}{o.usar_beca && ' · 🎓'}
                          {o.doble_faz ? ' · 2F' : ' · 1F'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleDownloadFile(o.archivo_url, o.archivo_nombre)}>
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                        <Select value={o.estado_produccion || 'para_hacer'} onValueChange={(v) => updateEstadoProduccion(o.id, v)}>
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="para_hacer">Para hacer</SelectItem>
                            <SelectItem value="hecho">Hecho</SelectItem>
                            <SelectItem value="retirado">Retirado</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar esta orden?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se eliminará la orden "{o.archivo_nombre}" y todos sus datos asociados. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteOrden(o.id, o.archivo_url)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {visibleOrdenes.length === 0 && <p className="text-center text-muted-foreground py-8">No hay órdenes pagadas</p>}
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
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Carillas</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Hojas</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Opciones</th>
                        <th className="text-right py-2 px-2 font-medium text-muted-foreground">Monto</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Producción</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Acciones</th>
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
                            <td className="py-2 px-2 text-right">{o.cantidad_paginas}</td>
                            <td className="py-2 px-2 text-right">{o.cantidad_hojas}</td>
                            <td className="py-2 px-2">
                              <div className="flex gap-1">
                                {!o.doble_faz && <Badge variant="outline" className="text-xs">1F</Badge>}
                                {o.doble_faz && <Badge variant="outline" className="text-xs">2F</Badge>}
                                {o.color && <Badge variant="outline" className="text-xs">Color</Badge>}
                                {o.anillado && <Badge variant="outline" className="text-xs">Anil.</Badge>}
                                {o.usar_beca && <Badge variant="outline" className="text-xs">🎓</Badge>}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right font-medium">${Number(o.monto_final).toLocaleString('es-AR')}</td>
                            <td className="py-2 px-2">
                              <Select value={o.estado_produccion || 'para_hacer'} onValueChange={(v) => updateEstadoProduccion(o.id, v)}>
                                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="para_hacer">Para hacer</SelectItem>
                                  <SelectItem value="hecho">Hecho</SelectItem>
                                  <SelectItem value="retirado">Retirado</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2 px-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar esta orden?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se eliminará la orden "{o.archivo_nombre}" y todos sus datos asociados.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteOrden(o.id, o.archivo_url)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
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

          {/* Becas tab - unified search & deduction */}
          <TabsContent value="becas" className="mt-4 space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5" /> Buscar y descontar carillas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Buscá un usuario por DNI o seleccionalo de la lista para descontarle carillas manualmente.
                </p>

                <div className="flex gap-3 items-end">
                  <div className="space-y-1 flex-1 max-w-xs">
                    <Label className="text-xs">Buscar por DNI</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingresá el DNI..."
                      value={dniSearch}
                      onChange={e => { setDniSearch(e.target.value.replace(/\D/g, '')); setDeductUserId(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleDniSearch()}
                    />
                  </div>
                  <Button onClick={handleDniSearch} disabled={dniSearching} className="gap-2">
                    {dniSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Buscar
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">o seleccioná de la lista</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Alumno</Label>
                  <Select value={deductUserId} onValueChange={(val) => {
                    setDeductUserId(val);
                    setDniSearchResult(null);
                    setDniSearch('');
                    const bu = becaUsers.find((b: any) => b.user_id === val);
                    if (bu) {
                      setDniSearchResult({
                        user_id: bu.user_id,
                        nombre_completo: bu.nombre,
                        carrera: '',
                        beca: { tipo: bu.tipo },
                        disponible: bu.disponible,
                        limite: bu.limite,
                      });
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar alumno..." /></SelectTrigger>
                    <SelectContent>
                      {becaUsers.map((bu: any) => (
                        <SelectItem key={bu.user_id} value={bu.user_id}>
                          {bu.nombre} (DNI: {bu.dni}) — Beca {bu.tipo}% — Disponible: {bu.disponible}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {dniSearchResult && (
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="font-medium">{dniSearchResult.nombre_completo}</p>
                      </div>
                      {dniSearchResult.carrera && (
                        <div>
                          <p className="text-xs text-muted-foreground">Carrera</p>
                          <p className="font-medium">{dniSearchResult.carrera}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Beca</p>
                        <p className="font-medium">{dniSearchResult.beca ? `${dniSearchResult.beca.tipo}%` : 'Sin beca'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Carillas disponibles</p>
                        <p className={`font-bold ${dniSearchResult.disponible < 50 ? 'text-destructive' : 'text-primary'}`}>
                          {dniSearchResult.beca ? `${dniSearchResult.disponible} / ${dniSearchResult.limite}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {dniSearchResult.beca && dniSearchResult.disponible > 0 && (
                      <div className="flex gap-3 items-end">
                        <div className="space-y-1 w-32">
                          <Label className="text-xs">Carillas a descontar</Label>
                          <Input type="number" min="1" max={dniSearchResult.disponible} value={dniDeductCarillas} onChange={e => setDniDeductCarillas(e.target.value)} placeholder="Cant." />
                        </div>
                        <Button onClick={handleDniDeduct} disabled={dniDeducting} className="gap-2">
                          {dniDeducting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                          Descontar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Becas activas</CardTitle></CardHeader>
              <CardContent>
                {becaUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay becas activas</p>
                ) : (
                  <div className="space-y-2">
                    {becaUsers.map((bu: any) => (
                      <div key={bu.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{bu.nombre} (DNI: {bu.dni})</p>
                          <p className="text-xs text-muted-foreground">
                            Beca {bu.tipo}% · Usadas: {bu.uso}/{bu.limite} carillas · Disponible: <span className={bu.disponible < 50 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{bu.disponible}</span>
                          </p>
                        </div>
                        <Badge className="bg-primary/20 text-primary">{bu.tipo}%</Badge>
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
              <CardHeader><CardTitle className="text-lg">💰 Precios y límites de becas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pricingConfig.map((c: any) => {
                  const isCarillas = c.clave.startsWith('limite_beca');
                  return (
                    <div key={c.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{c.descripcion || c.clave}</p>
                        <p className="text-xs text-muted-foreground">{c.clave}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{isCarillas ? 'carillas' : '$'}</span>
                        <Input className="w-28" defaultValue={c.valor} onBlur={e => updateConfig(c.clave, e.target.value)} />
                      </div>
                    </div>
                  );
                })}
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
