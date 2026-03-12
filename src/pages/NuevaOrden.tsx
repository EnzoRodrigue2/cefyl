import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, ArrowLeft, FileText, X, AlertTriangle, GraduationCap } from 'lucide-react';

interface FileEntry {
  file: File;
  estimatedPages: number;
  usarBeca: boolean;
}

export default function NuevaOrden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dobleFaz, setDobleFaz] = useState(false);
  const [color, setColor] = useState(false);
  const [anillado, setAnillado] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, number>>({});
  const [beca, setBeca] = useState<any>(null);
  const [becaUso, setBecaUso] = useState(0);
  const [limiteBeca, setLimiteBeca] = useState(5000);

  useEffect(() => { if (user) loadConfig(); }, [user]);

  async function loadConfig() {
    const [configRes, becaRes] = await Promise.all([
      supabase.from('configuraciones').select('*'),
      supabase.from('becas').select('*').eq('user_id', user!.id).eq('estado', 'aprobada').maybeSingle(),
    ]);
    const cfgMap: Record<string, number> = {};
    configRes.data?.forEach((c: any) => { cfgMap[c.clave] = Number(c.valor); });
    setConfig(cfgMap);
    setBeca(becaRes.data);
    setLimiteBeca(cfgMap.limite_beca_100 || 5000);

    if (becaRes.data?.tipo === '100') {
      const now = new Date();
      const usoRes = await supabase.from('beca_uso_mensual').select('monto_usado')
        .eq('user_id', user!.id).eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()).maybeSingle();
      setBecaUso(Number(usoRes.data?.monto_usado || 0));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles: FileEntry[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      if (f.type !== 'application/pdf') { toast.error(`"${f.name}" no es un PDF.`); continue; }
      if (f.size > 1024 * 1024 * 1024) { toast.error(`"${f.name}" supera 1GB`); continue; }
      if (files.some(fe => fe.file.name === f.name && fe.file.size === f.size)) { toast.error(`"${f.name}" ya fue agregado`); continue; }
      newFiles.push({ file: f, estimatedPages: Math.max(1, Math.round(f.size / 40000)), usarBeca: !!beca });
    }
    if (newFiles.length > 0) setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));
  const toggleBecaFile = (index: number) => setFiles(prev => prev.map((f, i) => i === index ? { ...f, usarBeca: !f.usarBeca } : f));

  const precioSimple = config.precio_simple_faz || 50;
  const precioDoble = config.precio_doble_faz || 40;
  const precioColor = config.precio_color || 100;

  function getAnilladoPrice(hojas: number) {
    if (hojas <= 50) return config.anillado_1_50 || 500;
    if (hojas <= 100) return config.anillado_51_100 || 800;
    return config.anillado_101_plus || 1200;
  }

  function calcFilePrice(f: FileEntry) {
    const hojas = dobleFaz ? Math.ceil(f.estimatedPages / 2) : f.estimatedPages;
    const precioPorHoja = dobleFaz ? precioDoble : precioSimple;
    let base = hojas * precioPorHoja;
    if (color) base += hojas * precioColor;
    if (anillado) base += getAnilladoPrice(hojas);
    const descPct = f.usarBeca && beca ? (beca.tipo === '100' ? 100 : beca.tipo === '50' ? 50 : 0) : 0;
    const descuento = base * (descPct / 100);
    return { hojas, base, descPct, descuento, final: base - descuento };
  }

  const totals = files.map(calcFilePrice);
  const totalFinal = totals.reduce((s, t) => s + t.final, 0);
  const totalBase = totals.reduce((s, t) => s + t.base, 0);
  const totalDescuento = totals.reduce((s, t) => s + t.descuento, 0);
  const totalHojas = totals.reduce((s, t) => s + t.hojas, 0);
  const saldoDisponible = beca?.tipo === '100' ? limiteBeca - becaUso : null;

  const handleSubmit = async () => {
    if (files.length === 0 || !user) return;
    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const { file, estimatedPages, usarBeca } = files[i];
        const { hojas, base, descuento, final: montoFinal, descPct } = totals[i];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('print-files').upload(filePath, file);
        if (uploadError) throw new Error(`Error subiendo "${file.name}": ${uploadError.message}`);

        const { error: orderError } = await supabase.from('ordenes').insert({
          user_id: user.id,
          archivo_url: filePath,
          archivo_nombre: file.name,
          cantidad_paginas: estimatedPages,
          doble_faz: dobleFaz,
          color,
          anillado,
          usar_beca: usarBeca && !!beca,
          comentarios,
          cantidad_hojas: hojas,
          precio_base: base,
          descuento_beca: descuento,
          monto_final: montoFinal,
          estado: 'pendiente_pago',
        });
        if (orderError) throw new Error(`Error creando orden para "${file.name}": ${orderError.message}`);
      }
      toast.success(`¡${files.length > 1 ? `${files.length} órdenes creadas` : 'Orden creada'} exitosamente!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la orden');
    }
    setLoading(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        {/* Banner "Usalo a conciencia" */}
        {beca && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-primary">🌱 ¡Usá tu beca a conciencia!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tu beca del {beca.tipo}% es un recurso compartido. Imprimí solo lo necesario para cuidar el medio ambiente y que más compañeros puedan beneficiarse.
              </p>
              {saldoDisponible !== null && (
                <p className="text-xs font-medium mt-1">
                  Saldo disponible este mes: <span className={saldoDisponible < 1000 ? 'text-destructive' : 'text-primary'}>${saldoDisponible.toLocaleString('es-AR')}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Nueva impresión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File upload */}
            <div className="space-y-2">
              <Label>Archivos PDF</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Hacé clic para subir tus PDFs</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo 1GB por archivo · Podés subir varios</p>
              </div>
              <input id="file-input" type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {/* File list with per-file beca toggle */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Archivos ({files.length})</Label>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(f.file.size)} · ~{f.estimatedPages} pág · {totals[i]?.hojas} hojas · ${totals[i]?.final.toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {beca && (
                        <div className="flex items-center gap-1.5" title="Usar beca en este archivo">
                          <Checkbox checked={f.usarBeca} onCheckedChange={() => toggleBecaFile(i)} />
                          <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeFile(i)} className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Doble faz</Label>
                <Switch checked={dobleFaz} onCheckedChange={setDobleFaz} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Color</Label>
                <Switch checked={color} onCheckedChange={setColor} />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label>Anillado</Label>
                <p className="text-xs text-muted-foreground">
                  {totalHojas > 0 && anillado ? `$${getAnilladoPrice(totalHojas).toLocaleString('es-AR')} por archivo` : 'Precio según cantidad de hojas'}
                </p>
              </div>
              <Switch checked={anillado} onCheckedChange={setAnillado} />
            </div>

            <div className="space-y-2">
              <Label>Comentarios (opcional)</Label>
              <Textarea value={comentarios} onChange={e => setComentarios(e.target.value)} placeholder="Instrucciones especiales..." />
            </div>

            {/* Price summary */}
            {files.length > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hojas totales: {totalHojas}</span>
                  <span>{dobleFaz ? 'Doble faz' : 'Simple faz'} · ${(dobleFaz ? precioDoble : precioSimple)}/hoja{color ? ` + $${precioColor}/color` : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalBase.toLocaleString('es-AR')}</span>
                </div>
                {totalDescuento > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Descuento beca</span>
                    <span>-${totalDescuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${totalFinal.toLocaleString('es-AR')}</span>
                </div>
                {files.length > 1 && <p className="text-xs text-muted-foreground">Se crearán {files.length} órdenes individuales</p>}
              </div>
            )}

            <Button onClick={handleSubmit} disabled={files.length === 0 || loading} className="w-full">
              {loading ? 'Creando...' : files.length > 1 ? `Crear ${files.length} órdenes` : 'Crear orden'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
