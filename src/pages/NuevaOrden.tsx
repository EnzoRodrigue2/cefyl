import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, ArrowLeft, FileText, X } from 'lucide-react';

interface FileEntry {
  file: File;
  estimatedPages: number;
}

export default function NuevaOrden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dobleFaz, setDobleFaz] = useState(false);
  const [color, setColor] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [precioPorHoja, setPrecioPorHoja] = useState(50);
  const [beca, setBeca] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, [user]);

  async function loadConfig() {
    const [configRes, becaRes] = await Promise.all([
      supabase.from('configuraciones').select('*').eq('clave', 'precio_por_hoja').single(),
      supabase.from('becas').select('*').eq('user_id', user!.id).eq('estado', 'aprobada').maybeSingle(),
    ]);
    if (configRes.data) setPrecioPorHoja(Number(configRes.data.valor));
    setBeca(becaRes.data);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileEntry[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      if (f.type !== 'application/pdf') {
        toast.error(`"${f.name}" no es un PDF. Solo se aceptan archivos PDF.`);
        continue;
      }
      if (f.size > 1024 * 1024 * 1024) {
        toast.error(`"${f.name}" supera el límite de 1GB`);
        continue;
      }
      // Check if already added
      if (files.some(fe => fe.file.name === f.name && fe.file.size === f.size)) {
        toast.error(`"${f.name}" ya fue agregado`);
        continue;
      }
      const estimatedPages = Math.max(1, Math.round(f.size / 40000));
      newFiles.push({ file: f, estimatedPages });
    }
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const totalPaginas = files.reduce((sum, f) => sum + f.estimatedPages, 0);
  const hojas = dobleFaz ? Math.ceil(totalPaginas / 2) : totalPaginas;
  const precioBase = hojas * precioPorHoja;
  const descuentoPct = beca ? (beca.tipo === '100' ? 100 : beca.tipo === '50' ? 50 : 0) : 0;
  const descuento = precioBase * (descuentoPct / 100);
  const montoFinal = precioBase - descuento;

  const handleSubmit = async () => {
    if (files.length === 0 || !user) return;
    setLoading(true);
    try {
      // Upload all files and create an order for each
      for (const { file, estimatedPages } of files) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('print-files').upload(filePath, file);
        if (uploadError) throw new Error(`Error subiendo "${file.name}": ${uploadError.message}`);

        const fileHojas = dobleFaz ? Math.ceil(estimatedPages / 2) : estimatedPages;
        const filePrecioBase = fileHojas * precioPorHoja;
        const fileDescuento = filePrecioBase * (descuentoPct / 100);
        const fileMontoFinal = filePrecioBase - fileDescuento;

        const { error: orderError } = await supabase.from('ordenes').insert({
          user_id: user.id,
          archivo_url: filePath,
          archivo_nombre: file.name,
          cantidad_paginas: estimatedPages,
          doble_faz: dobleFaz,
          color,
          comentarios,
          cantidad_hojas: fileHojas,
          precio_base: filePrecioBase,
          descuento_beca: fileDescuento,
          monto_final: fileMontoFinal,
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
          <ArrowLeft className="h-4 w-4" /> Volver a IMPRESIONES CEFyL
        </Button>

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
                <p className="text-xs text-muted-foreground mt-1">Máximo 1GB por archivo · Podés subir varios a la vez</p>
              </div>
              <input id="file-input" type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Archivos seleccionados ({files.length})</Label>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(f.file.size)} · ~{f.estimatedPages} páginas</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(i)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
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

            <div className="space-y-2">
              <Label>Comentarios (opcional)</Label>
              <Textarea value={comentarios} onChange={e => setComentarios(e.target.value)} placeholder="Instrucciones especiales..." />
            </div>

            {/* Price summary */}
            {files.length > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total páginas: {totalPaginas} · Hojas: {hojas}</span>
                  <span>${precioPorHoja}/hoja</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Precio base</span>
                  <span>${precioBase.toLocaleString('es-AR')}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Descuento beca ({descuentoPct}%)</span>
                    <span>-${descuento.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${montoFinal.toLocaleString('es-AR')}</span>
                </div>
                {files.length > 1 && (
                  <p className="text-xs text-muted-foreground">Se crearán {files.length} órdenes individuales</p>
                )}
              </div>
            )}

            <Button onClick={handleSubmit} disabled={files.length === 0 || loading} className="w-full">
              {loading ? 'Creando orden...' : files.length > 1 ? `Crear ${files.length} órdenes` : 'Crear orden'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
