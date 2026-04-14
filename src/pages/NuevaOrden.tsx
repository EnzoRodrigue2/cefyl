import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
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
import { Upload, ArrowLeft, FileText, X, AlertTriangle, GraduationCap, Image, BookOpen, Palette } from 'lucide-react';

interface FileEntry {
  file: File;
  estimatedPages: number;
  usarBeca: boolean;
  anillado: boolean;
  color: boolean;
}

export default function NuevaOrden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [simpleFaz, setSimpleFaz] = useState(false);
  // color and anillado are now per-file
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, number>>({});
  const [beca, setBeca] = useState<any>(null);
  const [becaUso, setBecaUso] = useState(0);
  const [limiteBeca, setLimiteBeca] = useState(500);

  const dobleFaz = !simpleFaz;

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

    const limite = becaRes.data?.tipo === '100'
      ? (cfgMap.limite_beca_100 || 500)
      : (cfgMap.limite_beca_50 || 200);
    setLimiteBeca(limite);

    if (becaRes.data) {
      const now = new Date();
      const usoRes = await supabase.from('beca_uso_mensual').select('monto_usado')
        .eq('user_id', user!.id).eq('mes', now.getMonth() + 1).eq('anio', now.getFullYear()).maybeSingle();
      setBecaUso(Number(usoRes.data?.monto_usado || 0));
    }
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpeg', '.jpg'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles: FileEntry[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      const ext = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));
      if (!allowedTypes.includes(f.type) && !allowedExtensions.includes(ext)) {
        toast.error(`"${f.name}" no es un formato permitido. Usá PDF, Word, PNG o JPG.`);
        continue;
      }
      if (f.size > 1024 * 1024 * 1024) { toast.error(`"${f.name}" supera 1GB`); continue; }
      if (files.some(fe => fe.file.name === f.name && fe.file.size === f.size)) { toast.error(`"${f.name}" ya fue agregado`); continue; }
      
      let pageCount = 1;
      if (f.type === 'application/pdf' || ext === '.pdf') {
        try {
          const arrayBuffer = await f.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          pageCount = pdf.numPages;
        } catch (err) {
          console.warn(`No se pudo leer páginas de "${f.name}", usando estimación`, err);
          pageCount = Math.max(1, Math.round(f.size / 40000));
        }
      } else {
        pageCount = 1;
      }
      
      newFiles.push({ file: f, estimatedPages: pageCount, usarBeca: !!beca, anillado: false, color: false });
    }
    if (newFiles.length > 0) setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));
  const toggleBecaFile = (index: number) => setFiles(prev => prev.map((f, i) => i === index ? { ...f, usarBeca: !f.usarBeca } : f));
  const toggleAnilladoFile = (index: number) => setFiles(prev => prev.map((f, i) => i === index ? { ...f, anillado: !f.anillado } : f));
  const toggleColorFile = (index: number) => setFiles(prev => prev.map((f, i) => i === index ? { ...f, color: !f.color } : f));

  const precioSimple = config.precio_simple_faz || 50;
  const precioDoble = config.precio_doble_faz || 40;
  const precioColor = config.precio_color || 100;

  function getAnilladoPrice(hojas: number) {
    if (hojas <= 50) return config.anillado_1_50 || 500;
    if (hojas <= 100) return config.anillado_51_100 || 800;
    return config.anillado_101_plus || 1200;
  }

  function calcFilePrice(f: FileEntry) {
    const carillas = f.estimatedPages;
    const hojas = dobleFaz ? Math.ceil(carillas / 2) : carillas;
    const precioPorHoja = dobleFaz ? precioDoble : precioSimple;
    let costoImpresion = hojas * precioPorHoja;
    if (f.color) costoImpresion += hojas * precioColor;
    const costoAnillado = f.anillado ? getAnilladoPrice(hojas) : 0;
    const base = costoImpresion + costoAnillado;

    let carillasConBeca = 0;
    let descuento = 0;
    if (f.usarBeca && beca) {
      const carillasDisponibles = Math.max(0, limiteBeca - becaUso);
      carillasConBeca = Math.min(carillas, carillasDisponibles);
      const descPct = beca.tipo === '100' ? 100 : beca.tipo === '50' ? 50 : 0;
      // Beca solo cubre impresión (carillas), NO anillado
      const precioPorCarilla = costoImpresion / carillas;
      descuento = carillasConBeca * precioPorCarilla * (descPct / 100);
    }

    return { carillas, hojas, base, costoAnillado, descuento, carillasConBeca, final: base - descuento };
  }

  const totals = files.map(calcFilePrice);
  const totalFinal = totals.reduce((s, t) => s + t.final, 0);
  const totalBase = totals.reduce((s, t) => s + t.base, 0);
  const totalDescuento = totals.reduce((s, t) => s + t.descuento, 0);
  const totalHojas = totals.reduce((s, t) => s + t.hojas, 0);
  const totalCarillas = totals.reduce((s, t) => s + t.carillas, 0);
  const totalCarillasBeca = totals.reduce((s, t) => s + t.carillasConBeca, 0);
  const totalAnillado = totals.reduce((s, t) => s + t.costoAnillado, 0);
  const carillasDisponibles = Math.max(0, limiteBeca - becaUso);

  const handleSubmit = async () => {
    if (files.length === 0 || !user) return;
    setLoading(true);
    try {
      // 1. Create a single order with aggregated totals
      const usarBecaGlobal = files.some(f => f.usarBeca) && !!beca;
      const { data: orderData, error: orderError } = await supabase.from('ordenes').insert({
        user_id: user.id,
        archivo_url: '', // no longer used for single file
        archivo_nombre: files.length === 1 ? files[0].file.name : `${files.length} archivos`,
        cantidad_paginas: totalCarillas,
        doble_faz: dobleFaz,
        color: files.some(f => f.color),
        anillado: files.some(f => f.anillado),
        usar_beca: usarBecaGlobal,
        comentarios,
        cantidad_hojas: totalHojas,
        precio_base: totalBase,
        descuento_beca: totalDescuento,
        monto_final: totalFinal,
        estado: 'pendiente_pago',
      }).select('id').single();

      if (orderError) throw new Error(`Error creando orden: ${orderError.message}`);
      const orderId = orderData.id;

      // 2. Upload each file and create orden_archivos records
      for (let i = 0; i < files.length; i++) {
        const { file, estimatedPages } = files[i];
        const { hojas } = totals[i];
        const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${user.id}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage.from('print-files').upload(filePath, file);
        if (uploadError) throw new Error(`Error subiendo "${file.name}": ${uploadError.message}`);

        const { error: archivoError } = await supabase.from('orden_archivos').insert({
          orden_id: orderId,
          archivo_url: filePath,
          archivo_nombre: file.name,
          cantidad_paginas: estimatedPages,
          cantidad_hojas: hojas,
        });
        if (archivoError) throw new Error(`Error registrando "${file.name}": ${archivoError.message}`);
      }

      // 3. Payment flow
      if (totalFinal > 0) {
        toast.info('Redirigiendo a Mercado Pago...');
        const { data: mpData, error: mpError } = await supabase.functions.invoke('create-mp-preference', {
          body: {
            orden_ids: [orderId],
            back_url: window.location.origin + '/dashboard',
          },
        });
        if (mpError || !mpData?.init_point) {
          toast.error('Error al generar el pago. Podés pagar desde tu dashboard.');
          navigate('/dashboard');
        } else {
          window.location.href = mpData.init_point;
        }
      } else {
        // Beca covers 100%
        await supabase.from('ordenes').update({ estado: 'pagado' }).eq('id', orderId);

        if (usarBecaGlobal && totalCarillasBeca > 0) {
          const now = new Date();
          const mes = now.getMonth() + 1;
          const anio = now.getFullYear();
          const { data: existing } = await supabase.from('beca_uso_mensual')
            .select('*').eq('user_id', user!.id).eq('mes', mes).eq('anio', anio).maybeSingle();
          if (existing) {
            await supabase.from('beca_uso_mensual').update({
              monto_usado: Number(existing.monto_usado || 0) + totalCarillasBeca
            }).eq('id', existing.id);
          } else {
            await supabase.from('beca_uso_mensual').insert({
              user_id: user!.id, mes, anio, monto_usado: totalCarillasBeca
            });
          }
        }
        toast.success('¡Orden creada exitosamente! Beca cubrió el total.');
        navigate('/dashboard?pedido=confirmado');
      }
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
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
              <p className="text-xs font-medium mt-1">
                Carillas disponibles este mes: <span className={carillasDisponibles < 50 ? 'text-destructive' : 'text-primary'}>{carillasDisponibles} de {limiteBeca}</span>
              </p>
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
              <Label>Archivos</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Hacé clic para subir tus archivos</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, Word, PNG, JPG · Máximo 1GB por archivo · Podés subir varios</p>
              </div>
              <input id="file-input" type="file" accept=".pdf,.doc,.docx,.png,.jpeg,.jpg" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {/* File list with per-file beca toggle */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Archivos ({files.length})</Label>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {f.file.type.startsWith('image/') ? <Image className="h-5 w-5 text-primary shrink-0" /> : <FileText className="h-5 w-5 text-primary shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(f.file.size)} · ~{f.estimatedPages} carillas · {totals[i]?.hojas} hojas
                          {f.anillado && ` · Anillado $${totals[i]?.costoAnillado.toLocaleString('es-AR')}`}
                          {' · $'}{totals[i]?.final.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5" title="Anillar este archivo">
                        <Checkbox checked={f.anillado} onCheckedChange={() => toggleAnilladoFile(i)} />
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Simple faz</Label>
                <Switch checked={simpleFaz} onCheckedChange={setSimpleFaz} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Color</Label>
                <Switch checked={color} onCheckedChange={setColor} />
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Label>Anillado</Label>
                <span className="text-xs text-muted-foreground">(se selecciona por archivo, no está cubierto por beca)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Activá el anillado en cada archivo desde la lista de arriba
              </p>
            </div>

            <div className="space-y-2">
              <Label>Comentarios (opcional)</Label>
              <Textarea value={comentarios} onChange={e => setComentarios(e.target.value)} placeholder="Instrucciones especiales..." />
            </div>

            {/* Price summary */}
            {files.length > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="text-sm space-y-1 sm:space-y-0 sm:flex sm:justify-between">
                   <span>Carillas: {totalCarillas} · Hojas: {totalHojas} · {files.length} archivo{files.length > 1 ? 's' : ''}</span>
                   <span>{dobleFaz ? 'Doble faz' : 'Simple faz'} · ${(dobleFaz ? precioDoble : precioSimple)}/hoja{color ? ` + $${precioColor}/color` : ''}</span>
                 </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalBase.toLocaleString('es-AR')}</span>
                </div>
                {totalAnillado > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Incluye anillado ({files.filter(f => f.anillado).length} archivo{files.filter(f => f.anillado).length > 1 ? 's' : ''})</span>
                    <span>${totalAnillado.toLocaleString('es-AR')}</span>
                  </div>
                )}
                {totalDescuento > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Descuento beca ({totalCarillasBeca} carillas cubiertas, no incluye anillado)</span>
                    <span>-${totalDescuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${totalFinal.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={files.length === 0 || loading} className="w-full">
              {loading ? 'Procesando...' : totalFinal > 0 ? `Pagar $${totalFinal.toLocaleString('es-AR')} con Mercado Pago` : 'Crear orden (cubierta por beca)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
