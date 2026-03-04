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
import { Upload, ArrowLeft, FileText } from 'lucide-react';

export default function NuevaOrden() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dobleFaz, setDobleFaz] = useState(false);
  const [color, setColor] = useState(false);
  const [comentarios, setComentarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [precioPorHoja, setPrecioPorHoja] = useState(50);
  const [beca, setBeca] = useState<any>(null);
  const [paginas, setPaginas] = useState(0);

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
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Solo se aceptan archivos PDF'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('El archivo no puede superar 20MB'); return; }
    setFile(f);
    // Estimate pages (rough: 1 page ≈ 40KB for text PDF)
    const estimatedPages = Math.max(1, Math.round(f.size / 40000));
    setPaginas(estimatedPages);
  };

  const hojas = dobleFaz ? Math.ceil(paginas / 2) : paginas;
  const precioBase = hojas * precioPorHoja;
  const descuentoPct = beca ? (beca.tipo === '100' ? 100 : beca.tipo === '50' ? 50 : 0) : 0;
  const descuento = precioBase * (descuentoPct / 100);
  const montoFinal = precioBase - descuento;

  const handleSubmit = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('print-files').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: orderError } = await supabase.from('ordenes').insert({
        user_id: user.id,
        archivo_url: filePath,
        archivo_nombre: file.name,
        cantidad_paginas: paginas,
        doble_faz: dobleFaz,
        color,
        comentarios,
        cantidad_hojas: hojas,
        precio_base: precioBase,
        descuento_beca: descuento,
        monto_final: montoFinal,
        estado: 'pendiente_pago',
      });
      if (orderError) throw orderError;

      toast.success('¡Orden creada exitosamente!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la orden');
    }
    setLoading(false);
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
              <Label>Archivo PDF</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}>
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">({paginas} páginas est.)</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Hacé clic para subir tu PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Máximo 20MB</p>
                  </div>
                )}
              </div>
              <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </div>

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
            {file && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hojas: {hojas}</span>
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
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
              {loading ? 'Creando orden...' : 'Crear orden'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
