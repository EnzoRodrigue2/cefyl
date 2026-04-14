import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import cefylLogo from '@/assets/cefyl-logo.jpg';

const CARRERAS = [
  'Artes',
  'Bibliotecología',
  'Ciencias Antropológicas',
  'Ciencias de la Educación',
  'Edición',
  'Filosofía',
  'Geografía',
  'Historia',
  'Letras',
];

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regFechaNac, setRegFechaNac] = useState('');
  const [regCarrera, setRegCarrera] = useState('');

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
    if (!regDni || !regEmail || !regNombre || !regFechaNac || !regCarrera) {
      toast.error('Completá todos los campos');
      return;
    }
    if (regDni.length < 7 || regDni.length > 9 || !/^\d+$/.test(regDni)) {
      toast.error('El DNI debe tener entre 7 y 9 dígitos numéricos');
      return;
    }
    setLoading(true);
    const { error } = await signUp(regEmail, regDni, {
      nombre_completo: regNombre,
      dni: regDni,
      carrera: regCarrera,
      fecha_nacimiento: regFechaNac,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('¡Cuenta creada! Ya podés iniciar sesión con tu email y DNI como contraseña.');
      setMode('login');
      setLoginEmail(regEmail);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <img src={cefylLogo} alt="CEFyL - Centro de Estudiantes de Filosofía y Letras" className="h-24 mx-auto mb-4 rounded-lg" />
          <h1 className="text-2xl font-extrabold text-foreground">IMPRESIONES CEFyL</h1>
          <p className="text-sm text-muted-foreground mt-1">Centro de impresiones · Filosofía y Letras · UBA</p>
        </div>

        {mode === 'login' ? (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold text-center">Iniciar Sesión</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="tu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña (DNI)</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="Tu DNI" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                ¿No tenés cuenta?{' '}
                <button type="button" className="text-primary underline font-medium" onClick={() => setMode('register')}>
                  Registrate
                </button>
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-lg font-semibold text-center">Registro (sin beca)</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-nombre">Nombre completo</Label>
                  <Input id="reg-nombre" value={regNombre} onChange={e => setRegNombre(e.target.value)} required placeholder="Nombre y Apellido" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-dni">DNI (será tu contraseña)</Label>
                  <Input id="reg-dni" value={regDni} onChange={e => setRegDni(e.target.value)} required placeholder="12345678" maxLength={9} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="tu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-fecha">Fecha de nacimiento</Label>
                  <Input id="reg-fecha" type="date" value={regFechaNac} onChange={e => setRegFechaNac(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-carrera">Carrera</Label>
                  <select
                    id="reg-carrera"
                    value={regCarrera}
                    onChange={e => setRegCarrera(e.target.value)}
                    required
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Seleccioná tu carrera</option>
                    {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                ¿Ya tenés cuenta?{' '}
                <button type="button" className="text-primary underline font-medium" onClick={() => setMode('login')}>
                  Iniciá sesión
                </button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
