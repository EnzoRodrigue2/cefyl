import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Printer, GraduationCap } from 'lucide-react';

const CARRERAS = [
  'Ingeniería en Sistemas', 'Ingeniería Civil', 'Ingeniería Industrial',
  'Abogacía', 'Contador Público', 'Administración de Empresas',
  'Medicina', 'Psicología', 'Arquitectura', 'Diseño Gráfico',
];

export default function Auth() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [carrera, setCarrera] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) toast.error(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    if (regPassword.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
    if (!aceptaTerminos) { toast.error('Debes aceptar los términos y condiciones'); return; }
    if (!/^\d{7,8}$/.test(dni)) { toast.error('DNI inválido (7-8 dígitos)'); return; }

    setLoading(true);
    const { error } = await signUp(regEmail, regPassword, { nombre_completo: nombre, dni, carrera });
    if (error) toast.error(error.message);
    else toast.success('¡Registro exitoso! Revisá tu email para confirmar tu cuenta.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-primary">
              <Printer className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">PrintHub</h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <GraduationCap className="h-4 w-4" /> Tu centro de impresiones universitario
          </p>
        </div>

        <Card>
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nombre completo</Label>
                    <Input value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input value={dni} onChange={e => setDni(e.target.value)} required placeholder="12345678" maxLength={8} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Carrera</Label>
                    <Select value={carrera} onValueChange={setCarrera} required>
                      <SelectTrigger><SelectValue placeholder="Seleccioná tu carrera" /></SelectTrigger>
                      <SelectContent>
                        {CARRERAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={aceptaTerminos} onCheckedChange={(v) => setAceptaTerminos(!!v)} />
                    <label className="text-sm text-muted-foreground">Acepto los términos y condiciones</label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
