import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, User, Scissors, DollarSign, Check, X, Clock, 
  MapPin, Phone, Star, Menu, Shield, Settings, ChevronRight, 
  Instagram, Facebook, Award, Users, FileText, Lock, Mail, LogOut, UserPlus, Eye, EyeOff, Image, Upload, Trash2, Edit3, Ban, Power, ChevronLeft
} from 'lucide-react';

type Servicio = { id: number; nombre: string; descripcion: string; precio: number; duracion: string };
type BarberoPerfil = { id: number; nombre: string; especialidad: string; experiencia: string; foto: string };
type Cita = { id: number; usuario: string; telefono: string; barbero: string; servicio: string; fecha: string; hora: string; estado: 'Confirmada' | 'Pendiente' | 'Cancelada' };
type UsuarioSistema = { id: number; nombre: string; email: string; telefono: string; password?: string; rol: 'admin' | 'barbero'; especialidad?: string; experiencia?: string; foto?: string; activo?: boolean };
type DiaBloqueado = { barbero: string; fecha: string };

const SERVICIOS_DB: Servicio[] = [
  { id: 1, nombre: "Corte clásico", descripcion: "Corte tradicional a tijera o máquina con acabado de navaja y producto de estilismo.", precio: 25000, duracion: "30 min" },
  { id: 2, nombre: "Corte + Barba", descripcion: "Servicio completo de transformación con diseño de corte y ritual completo de barba.", precio: 35000, duracion: "50 min" },
  { id: 3, nombre: "Barba", descripcion: "Perfilado de barba con toallas calientes, aceites esenciales y acabado con navaja.", precio: 18000, duracion: "25 min" },
  { id: 4, nombre: "Corte Premium", descripcion: "Corte de alta precisión, lavado capilar con productos importados y mascarilla facial negra.", precio: 45000, duracion: "60 min" },
  { id: 5, nombre: "Diseño de barba", descripcion: "Marcado especializado, corrección de simetría y perfilado detallado.", precio: 20000, duracion: "30 min" },
  { id: 6, nombre: "Corte infantil", descripcion: "Corte de cabello para los más jóvenes con la misma dedicación y estilo clásico.", precio: 20000, duracion: "30 min" },
];

const HORAS_DISPONIBLES_DEFAULT = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

export default function App() {
  const [vista, setVista] = useState<'cliente' | 'login' | 'admin'>('cliente');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [usuarioLogueado, setUsuarioLogueado] = useState<UsuarioSistema | null>(null);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [mostrarPasswordNuevoBarbero, setMostrarPasswordNuevoBarbero] = useState(false);

  const [citas, setCitas] = useState<Cita[]>([]);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  
  const [diasBloqueados, setDiasBloqueados] = useState<DiaBloqueado[]>([]);
  const [fechaBloqueoInput, setFechaBloqueoInput] = useState('');
  const [barberoSeleccionadoBloqueo, setBarberoSeleccionadoBloqueo] = useState('');

  const [horariosPersonalizados, setHorariosPersonalizados] = useState<Record<string, string[]>>({});
  const [horaNumericaInput, setHoraNumericaInput] = useState('');
  const [ampmInput, setAmpmInput] = useState('AM');
  const [errorHorario, setErrorHorario] = useState('');
  const [barberoSeleccionadoHorario, setBarberoSeleccionadoHorario] = useState('');

  // 1. Ajuste del useState para que comience vacío[cite: 1]
  const [barberosRegistrados, setBarberosRegistrados] = useState<UsuarioSistema[]>([]);

  const [modoEdicionId, setModoEdicionId] = useState<number | null>(null);
  const [nuevoBarberoNombre, setNuevoBarberoNombre] = useState('');
  const [nuevoBarberoEmail, setNuevoBarberoEmail] = useState('');
  const [nuevoBarberoTel, setNuevoBarberoTel] = useState('');
  const [nuevoBarberoExperiencia, setNuevoBarberoExperiencia] = useState('');
  const [nuevoBarberoEspecialidad, setNuevoBarberoEspecialidad] = useState('');
  const [nuevoBarberoFoto, setNuevoBarberoFoto] = useState('');
  const [nuevoBarberoPass, setNuevoBarberoPass] = useState('');

  const barberosActivos = barberosRegistrados.filter(b => b.activo !== false);

  const [servicioElegido, setServicioElegido] = useState<Servicio>(SERVICIOS_DB[0]);
  const [barberoElegido, setBarberoElegido] = useState<BarberoPerfil>({
    id: 1, 
    nombre: "Daniel Morales",
    especialidad: "Barbero Senior",
    experiencia: "8 años",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
  });
  
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaCita, setFechaCita] = useState(hoyStr);
  const [horaCita, setHoraCita] = useState('09:00 AM');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [errorTelefonoCliente, setErrorTelefonoCliente] = useState('');
  const [reservaConfirmada, setReservaConfirmada] = useState<Cita | null>(null);

  const [fechaActualCalendario, setFechaActualCalendario] = useState(new Date());

  // 2. useEffect para conectar con el endpoint /api/barberos[cite: 1]
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/barberos`)
      .then(res => res.json())
      .then(data => {
        setBarberosRegistrados(data);
        if (data.length > 0) {
          // Seleccionar el primer barbero por defecto si existe
          setBarberoElegido({
            id: data[0].id,
            nombre: data[0].nombre,
            especialidad: data[0].especialidad || 'Barbero Profesional',
            experiencia: data[0].experiencia || 'Experto',
            foto: data[0].foto || ''
          });
        }
      })
      .catch(err => console.error("Error al cargar barberos:", err));
  }, []);

  useEffect(() => {
    if (barberosRegistrados.length > 0) {
      if (!barberoSeleccionadoBloqueo) setBarberoSeleccionadoBloqueo(barberosRegistrados[0].nombre);
      if (!barberoSeleccionadoHorario) setBarberoSeleccionadoHorario(barberosRegistrados[0].nombre);
    }
  }, [barberosRegistrados]);

  const formatearFechaLegible = (fechaIso: string) => {
    if (!fechaIso) return '';
    const partes = fechaIso.split('-');
    if (partes.length !== 3) return fechaIso;
    const [anio, mes, dia] = partes;
    const mesesAbre = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const nombreMes = mesesAbre[parseInt(mes, 10) - 1] || mes;
    return `${dia} de ${nombreMes} de ${anio}`;
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/citas`)
      .then(res => res.json())
      .then(data => setCitas(data))
      .catch(err => console.error("Error al cargar citas:", err));
  }, []);

  const barberoActualNombre = usuarioLogueado?.rol === 'barbero' ? usuarioLogueado.nombre : barberoElegido.nombre;
  const horasPermitidasParaBarbero = horariosPersonalizados[barberoActualNombre] || HORAS_DISPONIBLES_DEFAULT;

  const esDiaDelBarberoBloqueado = (nombreBarb: string, fecha: string) => {
    return diasBloqueados.some(d => d.barbero === nombreBarb && d.fecha === fecha);
  };

  useEffect(() => {
    if (!fechaCita || !barberoElegido) {
      setHorasOcupadas([]);
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/citas-ocupadas?barbero=${encodeURIComponent(barberoElegido.nombre)}&fecha=${fechaCita}`)
      .then(res => res.json())
      .then(data => {
        setHorasOcupadas(data);
        if (data.includes(horaCita) || !horasPermitidasParaBarbero.includes(horaCita)) {
          const primeraLibre = horasPermitidasParaBarbero.find(h => !data.includes(h));
          if (primeraLibre) setHoraCita(primeraLibre);
        }
      })
      .catch(err => console.error("Error al consultar horas ocupadas:", err));
  }, [barberoElegido, fechaCita, horariosPersonalizados]);

  const obtenerDiasMes = () => {
    const anio = fechaActualCalendario.getFullYear();
    const mes = fechaActualCalendario.getMonth();
    
    const primerDiaDelMes = new Date(anio, mes, 1);
    const ultimoDiaDelMes = new Date(anio, mes + 1, 0);
    
    const diasEnMes = ultimoDiaDelMes.getDate();
    let inicioDiaSemana = primerDiaDelMes.getDay() - 1;
    if (inicioDiaSemana === -1) inicioDiaSemana = 6;

    const diasArray = [];
    for (let i = 0; i < inicioDiaSemana; i++) {
      diasArray.push(null);
    }
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaIso = `${anio}-${mesStr}-${diaStr}`;
      diasArray.push({ dia, fechaIso });
    }
    return diasArray;
  };

  const cambiarMes = (direccion: number) => {
    const nuevoMes = new Date(fechaActualCalendario.getFullYear(), fechaActualCalendario.getMonth() + direccion, 1);
    setFechaActualCalendario(nuevoMes);
  };

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');

    if (emailLogin === 'admin@monarch.com' && passwordLogin === 'admin123') {
      const adminUser: UsuarioSistema = { id: 99, nombre: "Administrador General", email: emailLogin, telefono: "3000000000", rol: "admin", activo: true };
      setUsuarioLogueado(adminUser);
      setVista('admin');
      return;
    }

    const barberoEncontrado = barberosRegistrados.find(
      b => b.email === emailLogin && b.password === passwordLogin
    );

    if (barberoEncontrado) {
      if (barberoEncontrado.activo === false) {
        setErrorLogin('Tu cuenta se encuentra desactivada. Contacta al administrador.');
        return;
      }
      setUsuarioLogueado(barberoEncontrado);
      setVista('admin');
    } else {
      setErrorLogin('Correo o contraseña incorrectos.');
    }
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    setEmailLogin('');
    setPasswordLogin('');
    setVista('cliente');
  };

  const manejarArchivoFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => {
        setNuevoBarberoFoto(lector.result as string);
      };
      lector.readAsDataURL(archivo);
    }
  };

  // 3. Revisión de la función de creación de barberos para enviar datos al servidor (POST / PUT)[cite: 1]
  const guardarOActualizarBarbero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoBarberoNombre || !nuevoBarberoEmail || !nuevoBarberoTel || !nuevoBarberoExperiencia) return;

    const textoExperiencia = nuevoBarberoExperiencia.toLowerCase().includes('año') 
      ? nuevoBarberoExperiencia 
      : `${nuevoBarberoExperiencia} años`;

    const especialidadFinal = nuevoBarberoEspecialidad.trim() || 'Barbero Profesional';

    try {
      if (modoEdicionId !== null) {
        const barberoActual = barberosRegistrados.find(b => b.id === modoEdicionId);
        const datosActualizados = {
          nombre: nuevoBarberoNombre,
          email: nuevoBarberoEmail,
          telefono: nuevoBarberoTel,
          especialidad: especialidadFinal,
          experiencia: textoExperiencia,
          foto: nuevoBarberoFoto || barberoActual?.foto || '',
          password: nuevoBarberoPass ? nuevoBarberoPass : barberoActual?.password,
          activo: barberoActual?.activo ?? true
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/barberos/${modoEdicionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizados)
        });

        if (response.ok) {
          const barberoModificado = await response.json();
          setBarberosRegistrados(barberosRegistrados.map(b => b.id === modoEdicionId ? barberoModificado : b));
          
          if (barberoElegido.id === modoEdicionId) {
            setBarberoElegido({
              id: barberoModificado.id,
              nombre: barberoModificado.nombre,
              especialidad: barberoModificado.especialidad,
              experiencia: barberoModificado.experiencia,
              foto: barberoModificado.foto || ''
            });
          }
          setModoEdicionId(null);
          alert('¡Información del barbero actualizada exitosamente!');
        }
      } else {
        if (!nuevoBarberoPass) {
          alert('Por favor ingresa una contraseña para el nuevo barbero.');
          return;
        }

        const nuevoBarberoData = {
          nombre: nuevoBarberoNombre,
          email: nuevoBarberoEmail,
          telefono: nuevoBarberoTel,
          password: nuevoBarberoPass,
          rol: 'barbero',
          especialidad: especialidadFinal,
          experiencia: textoExperiencia,
          foto: nuevoBarberoFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
          activo: true
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/barberos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoBarberoData)
        });

        if (response.ok) {
          const barberoCreado = await response.json();
          setBarberosRegistrados([...barberosRegistrados, barberoCreado]);
          alert('¡Cuenta de barbero creada exitosamente!');
        }
      }

      setNuevoBarberoNombre('');
      setNuevoBarberoEmail('');
      setNuevoBarberoTel('');
      setNuevoBarberoExperiencia('');
      setNuevoBarberoEspecialidad('');
      setNuevoBarberoFoto('');
      setNuevoBarberoPass('');
    } catch (err) {
      console.error("Error al guardar el barbero en el servidor:", err);
      alert("Hubo un error al procesar la solicitud con el servidor.");
    }
  };

  const prepararEdicionBarbero = (b: UsuarioSistema) => {
    setModoEdicionId(b.id);
    setNuevoBarberoNombre(b.nombre);
    setNuevoBarberoEmail(b.email);
    setNuevoBarberoTel(b.telefono);
    setNuevoBarberoExperiencia(b.experiencia ? b.experiencia.replace(/[^0-9]/g, '') : '');
    setNuevoBarberoEspecialidad(b.especialidad || 'Barbero Profesional');
    setNuevoBarberoFoto(b.foto || '');
    setNuevoBarberoPass('');
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setModoEdicionId(null);
    setNuevoBarberoNombre('');
    setNuevoBarberoEmail('');
    setNuevoBarberoTel('');
    setNuevoBarberoExperiencia('');
    setNuevoBarberoEspecialidad('');
    setNuevoBarberoFoto('');
    setNuevoBarberoPass('');
  };

  const alternarEstadoBarbero = async (id: number, nombreBarbero: string, estadoActual?: boolean) => {
    const nuevoEstado = estadoActual === false ? true : false;
    const accionTexto = nuevoEstado ? 'activar' : 'desactivar';
    
    if (window.confirm(`¿Estás seguro de que deseas ${accionTexto} al barbero ${nombreBarbero}?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/barberos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activo: nuevoEstado })
        });

        if (response.ok) {
          setBarberosRegistrados(barberosRegistrados.map(b => {
            if (b.id === id) {
              return { ...b, activo: nuevoEstado };
            }
            return b;
          }));

          if (!nuevoEstado && barberoElegido.nombre === nombreBarbero) {
            const otroActivo = barberosRegistrados.find(b => b.id !== id && b.activo !== false);
            if (otroActivo) {
              setBarberoElegido({
                id: otroActivo.id,
                nombre: otroActivo.nombre,
                especialidad: otroActivo.especialidad || 'Barbero Profesional',
                experiencia: otroActivo.experiencia || 'Experto',
                foto: otroActivo.foto || ''
              });
            }
          }
        }
      } catch (err) {
        console.error("Error al cambiar estado del barbero:", err);
      }
    }
  };

  const alternarBloqueoDia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaBloqueoInput || !usuarioLogueado) return;
    
    const barberoNombre = usuarioLogueado.rol === 'admin' ? barberoSeleccionadoBloqueo : usuarioLogueado.nombre;
    if (!barberoNombre) return;

    const yaBloqueado = esDiaDelBarberoBloqueado(barberoNombre, fechaBloqueoInput);
    if (yaBloqueado) {
      setDiasBloqueados(diasBloqueados.filter(d => !(d.barbero === barberoNombre && d.fecha === fechaBloqueoInput)));
      alert(`Día ${formatearFechaLegible(fechaBloqueoInput)} habilitado nuevamente para ${barberoNombre}.`);
    } else {
      setDiasBloqueados([...diasBloqueados, { barbero: barberoNombre, fecha: fechaBloqueoInput }]);
      alert(`Día ${formatearFechaLegible(fechaBloqueoInput)} marcado como No Disponible para ${barberoNombre}.`);
    }
    setFechaBloqueoInput('');
  };

  const agregarHorarioBarbero = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHorario('');
    if (!horaNumericaInput || !usuarioLogueado) return;

    const regexHoraNumerica = /^(0?[1-9]|1[0-2]):([0-5][0-9])$/;
    const horaLimpia = horaNumericaInput.trim();

    if (!regexHoraNumerica.test(horaLimpia)) {
      setErrorHorario('Formato inválido. Ingrese hora y minutos válidos (Ej. 04:30 o 9:00).');
      return;
    }

    const horarioCompleto = `${horaLimpia} ${ampmInput}`;
    const barberoNombre = usuarioLogueado.rol === 'admin' ? barberoSeleccionadoHorario : usuarioLogueado.nombre;
    if (!barberoNombre) return;

    const actuales = horariosPersonalizados[barberoNombre] || HORAS_DISPONIBLES_DEFAULT;
    if (!actuales.includes(horarioCompleto)) {
      setHorariosPersonalizados({
        ...horariosPersonalizados,
        [barberoNombre]: [...actuales, horarioCompleto].sort()
      });
      alert(`Horario ${horarioCompleto} agregado exitosamente para ${barberoNombre}.`);
    } else {
      setErrorHorario('Este horario ya se encuentra registrado para este barbero.');
      return;
    }
    setHoraNumericaInput('');
  };

  const eliminarHorarioBarbero = (barberoObjNombre: string, horaAEliminar: string) => {
    if (!usuarioLogueado) return;
    const actuales = horariosPersonalizados[barberoObjNombre] || HORAS_DISPONIBLES_DEFAULT;
    setHorariosPersonalizados({
      ...horariosPersonalizados,
      [barberoObjNombre]: actuales.filter(h => h !== horaAEliminar)
    });
  };

  const confirmarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTelefonoCliente('');

    if (esDiaDelBarberoBloqueado(barberoElegido.nombre, fechaCita)) {
      alert("Lo sentimos, este barbero no se encuentra disponible en la fecha seleccionada.");
      return;
    }

    const telefonoLimpio = telefonoCliente.replace(/\D/g, '');
    if (telefonoLimpio.length !== 10) {
      setErrorTelefonoCliente('El número de teléfono debe contener exactamente 10 dígitos.');
      return;
    }

    if (!nombreCliente || !fechaCita) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: nombreCliente,
          telefono: telefonoLimpio,
          barbero: barberoElegido.nombre,
          servicio: servicioElegido.nombre,
          fecha: fechaCita,
          hora: horaCita,
          estado: 'Confirmada'
        })
      });

      const nuevaCitaGuardada = await response.json();
      const citaConDetalles: Cita = {
        ...nuevaCitaGuardada,
        usuario: nuevaCitaGuardada.cliente || nombreCliente,
        telefono: nuevaCitaGuardada.telefono || telefonoLimpio,
        estado: 'Confirmada'
      };

      setCitas([citaConDetalles, ...citas]);
      setReservaConfirmada(citaConDetalles);
      setNombreCliente('');
      setTelefonoCliente('');
      setErrorTelefonoCliente('');
    } catch (err) {
      console.error("Error al guardar la reserva:", err);
    }
  };

  const actualizarEstadoCita = async (id: number, nuevoEstado: 'Confirmada' | 'Pendiente' | 'Cancelada') => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/citas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      setCitas(citas.map(c => {
        if (c.id === id) {
          const citaActualizada = { ...c, estado: nuevoEstado };
          
          if (nuevoEstado === 'Cancelada') {
            const telefonoLimpio = citaActualizada.telefono ? citaActualizada.telefono.replace(/\D/g, '') : '';
            const mensaje = `Hola *${citaActualizada.usuario || 'Cliente'}*, te saludamos de *MONARCH BARBER*. Lamentamos informarte que tu cita con el barbero *${citaActualizada.barbero}* para el dia *${formatearFechaLegible(citaActualizada.fecha)}* a las *${citaActualizada.hora}* ha sido *CANCELADA*. Si deseas reagendar, puedes contactarnos. ¡Gracias!`;
            if (telefonoLimpio) {
              window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
            }
          } 
          else if (nuevoEstado === 'Confirmada') {
            const telefonoLimpio = citaActualizada.telefono ? citaActualizada.telefono.replace(/\D/g, '') : '';
            const mensaje = `¡Hola ${citaActualizada.usuario || 'Cliente'}! ✂️ Tu cita en *MONARCH BARBER* con el barbero *${citaActualizada.barbero}* para el dia *${formatearFechaLegible(citaActualizada.fecha)}* a las *${citaActualizada.hora}* ha sido *CONFIRMADA*. ¡Te esperamos!`;
            window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
          }
          
          return citaActualizada;
        }
        return c;
      }));
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const citasVisibles = usuarioLogueado?.rol === 'admin' 
    ? citas 
    : citas.filter(c => c.barbero === usuarioLogueado?.nombre);

  return (
    <div className="min-h-screen bg-[#111111] text-[#F5F1E8] font-sans selection:bg-[#C9A227] selection:text-black">
      
      <nav className="fixed top-0 w-full bg-[#111111]/95 backdrop-blur-md border-b border-[#C9A227]/20 px-6 md:px-16 py-5 flex justify-between items-center z-50 shadow-2xl">
        <div className="text-xl md:text-2xl font-bold tracking-[0.3em] text-[#F5F1E8] cursor-pointer font-serif" onClick={() => { setVista('cliente'); setReservaConfirmada(null); }}>
          MONARCH<span className="text-[#C9A227]">.</span>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.25em] font-medium">
          <a href="#inicio" className="text-[#A7A39A] hover:text-[#C9A227] transition">Inicio</a>
          <a href="#servicios" className="text-[#A7A39A] hover:text-[#C9A227] transition">Servicios</a>
          <a href="#barberos" className="text-[#A7A39A] hover:text-[#C9A227] transition">Barberos</a>
          <a href="#galeria" className="text-[#A7A39A] hover:text-[#C9A227] transition">Galería</a>
          <a href="#reservar" className="text-[#A7A39A] hover:text-[#C9A227] transition">Reservar</a>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {usuarioLogueado ? (
            <button 
              onClick={() => setVista('admin')}
              className="flex items-center gap-1.5 text-[#C9A227] hover:text-[#E0C36E] transition border border-[#C9A227]/30 px-3 py-1.5 rounded-sm bg-[#1A1A1A] text-[10px]"
            >
              <Settings size={14} />
              <span>Mi Panel</span>
            </button>
          ) : null}
          <a href="#reservar" className="bg-[#C9A227] text-black px-6 py-3 uppercase text-[10px] tracking-[0.25em] font-semibold hover:bg-[#E0C36E] transition shadow-lg">
            Reservar Cita
          </a>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-[#F5F1E8]">
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {menuAbierto && (
        <div className="fixed inset-x-0 top-[73px] bg-[#1A1A1A] border-b border-[#C9A227]/20 p-6 flex flex-col gap-4 z-40 lg:hidden shadow-2xl">
          <a href="#inicio" onClick={() => setMenuAbierto(false)} className="text-sm uppercase tracking-widest text-[#A7A39A] hover:text-[#C9A227]">Inicio</a>
          <a href="#servicios" onClick={() => setMenuAbierto(false)} className="text-sm uppercase tracking-widest text-[#A7A39A] hover:text-[#C9A227]">Servicios</a>
          <a href="#barberos" onClick={() => setMenuAbierto(false)} className="text-sm uppercase tracking-widest text-[#A7A39A] hover:text-[#C9A227]">Barberos</a>
          <a href="#galeria" onClick={() => setMenuAbierto(false)} className="text-sm uppercase tracking-widest text-[#A7A39A] hover:text-[#C9A227]">Galería</a>
          <a href="#reservar" onClick={() => setMenuAbierto(false)} className="text-sm uppercase tracking-widest text-[#C9A227]">Reservar Cita</a>
          
          {usuarioLogueado && (
            <button 
              onClick={() => { setVista('admin'); setMenuAbierto(false); }}
              className="text-xs uppercase tracking-widest text-[#C9A227] text-left pt-2 border-t border-[#2A2A2A]"
            >
              Mi Panel de Control
            </button>
          )}

          {!usuarioLogueado && (
            <div className="pt-4 border-t border-[#2A2A2A] flex justify-end">
              <button 
                onClick={() => { setVista('login'); setMenuAbierto(false); }}
                className="text-[10px] text-[#555] hover:text-[#A7A39A] tracking-wider transition uppercase flex items-center gap-1"
              >
                <span>Acceso interno</span>
              </button>
            </div>
          )}
        </div>
      )}

      {vista === 'login' && !usuarioLogueado && (
        <main className="min-h-[85vh] flex items-center justify-center pt-28 px-6">
          <div className="bg-[#1A1A1A] border border-[#C9A227]/30 p-8 md:p-12 max-w-md w-full shadow-2xl">
            <div className="text-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A227] block mb-2 font-medium">Restringido</span>
              <h1 className="text-3xl font-serif text-[#F5F1E8]">Portal de Barberos</h1>
              <p className="text-xs text-[#A7A39A] mt-2 font-light">Inicia sesión con tu cuenta creada por la administración.</p>
            </div>

            {errorLogin && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 text-xs mb-6 text-center">
                {errorLogin}
              </div>
            )}

            <form onSubmit={manejarLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="correo@monarch.com" 
                  className="w-full bg-[#111111] border border-[#2A2A2A] p-4 text-[#F5F1E8] placeholder:text-[#555] focus:outline-none focus:border-[#C9A227]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Contraseña</label>
                <div className="relative">
                  <input 
                    type={mostrarPasswordLogin ? "text" : "password"} 
                    required
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-[#111111] border border-[#2A2A2A] p-4 pr-12 text-[#F5F1E8] placeholder:text-[#555] focus:outline-none focus:border-[#C9A227]"
                  />
                  <button 
                    type="button"
                    onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7A39A] hover:text-[#C9A227] transition"
                  >
                    {mostrarPasswordLogin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#C9A227] text-black py-4 uppercase text-xs tracking-[0.25em] font-semibold hover:bg-[#E0C36E] transition shadow-xl">
                Iniciar Sesión
              </button>

              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => setVista('cliente')}
                  className="text-xs text-[#A7A39A] hover:text-[#C9A227] transition tracking-wider uppercase"
                >
                  ← Volver a la página principal
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {vista === 'cliente' && (
        <main id="inicio">
          
          <header className="relative min-h-[90vh] px-6 md:px-24 flex items-center justify-center overflow-hidden pt-20 border-b border-[#C9A227]/20">
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center filter brightness-75"
              style={{
                backgroundImage: "linear-gradient(90deg, rgba(17, 17, 17, 0.92) 0%, rgba(17, 17, 17, 0.70) 75%), url('https://images.unsplash.com/photo-1503951914875-452162b09f6f?auto=format&fit=crop&w=1920&q=80')"
              }}
            />
            <div className="relative z-10 max-w-4xl text-center w-full py-20 flex flex-col items-center">
              <span className="text-xs uppercase tracking-[0.4em] text-[#C9A227] mb-4 font-medium block">Est. 1989 · Monarch Barber</span>
              <h1 className="text-5xl md:text-8xl font-normal uppercase tracking-wide mb-8 leading-[1.05] text-[#F5F1E8] font-serif">
                El arte de verte bien.
              </h1>
              <p className="max-w-xl text-[#A7A39A] font-light mb-10 text-base md:text-lg leading-relaxed">
                Tradición, precisión y estilo en cada corte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#reservar" className="bg-[#C9A227] text-black px-10 py-4 uppercase text-xs tracking-[0.25em] font-semibold hover:bg-[#E0C36E] transition shadow-2xl text-center">
                  Reservar Cita
                </a>
                <a href="#servicios" className="border border-[#C9A227]/40 text-[#F5F1E8] px-10 py-4 uppercase text-xs tracking-[0.25em] font-medium hover:border-[#C9A227] hover:bg-[#1A1A1A] transition text-center">
                  Ver Servicios
                </a>
              </div>
            </div>
          </header>

          <section id="servicios" className="px-6 md:px-24 py-28 border-b border-[#C9A227]/20 bg-[#1A1A1A]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] font-medium block mb-2">Excelencia y Detalle</span>
                <h2 className="text-4xl md:text-5xl font-normal uppercase tracking-widest text-[#F5F1E8] font-serif">Nuestros Servicios</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SERVICIOS_DB.map(s => (
                  <div 
                    key={s.id} 
                    className={`p-8 border transition flex flex-col justify-between shadow-xl bg-[#111111] ${servicioElegido.id === s.id ? 'border-[#C9A227]' : 'border-[#2A2A2A] hover:border-[#C9A227]/50'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-normal text-[#F5F1E8] font-serif">{s.nombre}</h3>
                        <span className="text-[#C9A227] font-semibold text-lg font-serif">${s.precio.toLocaleString()}</span>
                      </div>
                      <p className="text-[#A7A39A] text-sm font-light mb-6 leading-relaxed">{s.descripcion}</p>
                    </div>
                    <div className="pt-6 border-t border-[#2A2A2A] flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] flex items-center gap-1">
                        <Clock size={12}/> {s.duracion}
                      </span>
                      <button 
                        onClick={() => { setServicioElegido(s); document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#C9A227] hover:text-black transition"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="barberos" className="px-6 md:px-24 py-28 border-b border-[#C9A227]/25">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] font-medium block mb-2">Maestría Artesanal</span>
                <h2 className="text-4xl md:text-5xl font-normal uppercase tracking-widest text-[#F5F1E8] font-serif">Maestros del Estilo</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {barberosActivos.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => setBarberoElegido({ id: b.id, nombre: b.nombre, especialidad: b.especialidad || 'Barbero Profesional', experiencia: b.experiencia || 'Experto', foto: b.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80' })}
                    className={`border cursor-pointer transition overflow-hidden bg-[#1A1A1A] group shadow-xl ${barberoElegido.id === b.id ? 'border-[#C9A227]' : 'border-[#2A2A2A] hover:border-[#C9A227]/50'}`}
                  >
                    <div className="h-80 overflow-hidden relative">
                      <img src={b.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'} alt={b.nombre} className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-90"></div>
                    </div>
                    <div className="p-6 -mt-12 relative z-10 text-center">
                      <h3 className="text-2xl font-normal text-[#F5F1E8] mb-1 font-serif">{b.nombre}</h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#C9A227] font-medium mb-2">{b.especialidad || 'Barbero Profesional'}</p>
                      <p className="text-[11px] text-[#A7A39A] font-light mb-6">{b.experiencia || 'Experto'}</p>
                      <span className={`inline-block px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium ${barberoElegido.id === b.id ? 'bg-[#C9A227] text-black' : 'bg-[#111111] text-[#A7A39A] border border-[#2A2A2A]'}`}>
                        {barberoElegido.id === b.id ? 'Seleccionado' : 'Elegir Barbero'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="reservar" className="px-6 md:px-24 py-28 bg-[#1A1A1A] border-b border-[#C9A227]/20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] font-medium block mb-2">Experiencia Exclusiva</span>
                <h2 className="text-4xl md:text-5xl font-normal uppercase tracking-widest text-[#F5F1E8] font-serif">Reserva de Citas</h2>
              </div>

              {reservaConfirmada ? (
                <div className="bg-[#111111] border border-[#C9A227] p-8 md:p-12 text-center shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-[#C9A227]/10 border border-[#C9A227] rounded-full flex items-center justify-center mx-auto text-[#C9A227]">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-3xl font-normal font-serif text-[#F5F1E8]">¡Cita agendada con éxito!</h3>
                  <p className="text-sm text-[#A7A39A]">Tu reserva ha sido confirmada automáticamente para el barbero <strong className="text-white">{reservaConfirmada.barbero}</strong>.</p>
                  
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 max-w-md mx-auto text-left space-y-3 text-sm text-[#A7A39A]">
                    <p><strong className="text-[#F5F1E8]">Servicio:</strong> {reservaConfirmada.servicio}</p>
                    <p><strong className="text-[#F5F1E8]">Barbero:</strong> {reservaConfirmada.barbero}</p>
                    <p><strong className="text-[#F5F1E8]">Fecha:</strong> {formatearFechaLegible(reservaConfirmada.fecha)}</p>
                    <p><strong className="text-[#F5F1E8]">Hora:</strong> {reservaConfirmada.hora}</p>
                    <p><strong className="text-[#F5F1E8]">Cliente:</strong> {reservaConfirmada.usuario} ({reservaConfirmada.telefono})</p>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setReservaConfirmada(null)}
                      className="border border-[#C9A227] text-[#C9A227] px-8 py-3 uppercase text-xs tracking-[0.2em] font-medium hover:bg-[#C9A227] hover:text-black transition"
                    >
                      Hacer Otra Reserva
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#C9A227]/20 p-8 md:p-12 shadow-2xl">
                  <p className="text-[#A7A39A] text-sm mb-8 font-light text-center">
                    Seleccionado: <strong className="text-[#F5F1E8]">{servicioElegido.nombre} (${servicioElegido.precio.toLocaleString()})</strong> con <strong className="text-[#F5F1E8]">{barberoElegido.nombre}</strong>.
                  </p>

                  <form onSubmit={confirmarReserva} className="space-y-8">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.2em] text-[#A7A39A] mb-3 font-medium">1. Seleccionar Servicio</label>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {SERVICIOS_DB.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => setServicioElegido(s)}
                            className={`p-3 border cursor-pointer text-xs transition ${servicioElegido.id === s.id ? 'border-[#C9A227] bg-[#1A1A1A] text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A7A39A] hover:border-[#C9A227]/40'}`}
                          >
                            <div className="font-semibold">{s.nombre}</div>
                            <div className="text-[#C9A227] mt-1">${s.precio.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.2em] text-[#A7A39A] mb-3 font-medium">2. Seleccionar Barbero</label>
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {barberosActivos.map(b => (
                          <div 
                            key={b.id}
                            onClick={() => setBarberoElegido({ id: b.id, nombre: b.nombre, especialidad: b.especialidad || 'Barbero Profesional', experiencia: b.experiencia || 'Experto', foto: b.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80' })}
                            className={`p-3 border cursor-pointer text-xs transition text-center ${barberoElegido.id === b.id ? 'border-[#C9A227] bg-[#1A1A1A] text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A7A39A] hover:border-[#C9A227]/40'}`}
                          >
                            <div className="font-semibold">{b.nombre}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-[11px] uppercase tracking-[0.2em] text-[#A7A39A] font-medium">3. Selecciona una Fecha</label>
                          <span className="text-[10px] text-[#C9A227] tracking-wider uppercase font-medium bg-[#1A1A1A] px-2 py-0.5 border border-[#C9A227]/30">
                            {fechaCita ? formatearFechaLegible(fechaCita) : 'Selecciona un día'}
                          </span>
                        </div>

                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 rounded-sm shadow-xl">
                          <div className="flex justify-between items-center mb-4">
                            <button 
                              type="button" 
                              onClick={() => cambiarMes(-1)} 
                              className="p-1.5 text-[#A7A39A] hover:text-[#C9A227] transition border border-[#2A2A2A] bg-[#111111]"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs uppercase tracking-widest font-serif font-semibold text-[#F5F1E8]">
                              {nombresMeses[fechaActualCalendario.getMonth()]} {fechaActualCalendario.getFullYear()}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => cambiarMes(1)} 
                              className="p-1.5 text-[#A7A39A] hover:text-[#C9A227] transition border border-[#2A2A2A] bg-[#111111]"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d, i) => (
                              <span key={i} className="text-[10px] uppercase tracking-wider text-[#777] font-semibold">{d}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-center">
                            {obtenerDiasMes().map((item, index) => {
                              if (!item) return <div key={index} />;
                              const esPasado = item.fechaIso < hoyStr;
                              const esSeleccionado = fechaCita === item.fechaIso;
                              const estaBloqueadoDia = esDiaDelBarberoBloqueado(barberoElegido.nombre, item.fechaIso);

                              return (
                                <button
                                  key={index}
                                  type="button"
                                  disabled={esPasado || estaBloqueadoDia}
                                  onClick={() => setFechaCita(item.fechaIso)}
                                  className={`py-2 text-xs transition font-medium ${
                                    esPasado || estaBloqueadoDia
                                      ? 'text-[#444] bg-[#111111]/30 cursor-not-allowed line-through'
                                      : esSeleccionado
                                        ? 'bg-[#C9A227] text-black font-bold shadow-md'
                                        : 'bg-[#111111] text-[#A7A39A] hover:border-[#C9A227]/50 border border-[#2A2A2A]'
                                  }`}
                                >
                                  {item.dia}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {esDiaDelBarberoBloqueado(barberoElegido.nombre, fechaCita) && (
                          <p className="text-red-400 text-xs mt-2 uppercase tracking-wider font-semibold">⚠️ Este barbero no labora el día seleccionado.</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.2em] text-[#A7A39A] mb-3 font-medium">4. Selecciona una Hora</label>
                        {esDiaDelBarberoBloqueado(barberoElegido.nombre, fechaCita) ? (
                          <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 text-xs text-center">
                            Día bloqueado por el barbero.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {horasPermitidasParaBarbero.map((hora) => {
                              const estaOcupada = horasOcupadas.includes(hora);
                              return (
                                <button
                                  key={hora}
                                  type="button"
                                  disabled={estaOcupada}
                                  onClick={() => setHoraCita(hora)}
                                  className={`py-3 text-xs border tracking-wider transition ${
                                    estaOcupada 
                                      ? 'border-[#2A2A2A] bg-[#151515] text-[#555] cursor-not-allowed line-through' 
                                      : horaCita === hora 
                                        ? 'border-[#C9A227] bg-[#C9A227] text-black font-bold' 
                                        : 'border-[#2A2A2A] bg-[#1A1A1A] text-[#A7A39A] hover:border-[#C9A227]/50'
                                  }`}
                                >
                                  {hora} {estaOcupada && '(Ocupada)'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[#2A2A2A]">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Nombre Completo *</label>
                        <input 
                          type="text" 
                          required
                          value={nombreCliente}
                          onChange={(e) => setNombreCliente(e.target.value)}
                          placeholder="Ej. Carlos Pérez" 
                          className="w-full bg-[#111111] border border-[#2A2A2A] p-4 text-[#F5F1E8] placeholder:text-[#555] focus:outline-none focus:border-[#C9A227]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Número de Teléfono *</label>
                        <input 
                          type="tel" 
                          required
                          maxLength={10}
                          value={telefonoCliente}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, '');
                            setTelefonoCliente(valor);
                            if (valor.length > 0 && valor.length !== 10) {
                              setErrorTelefonoCliente(`Faltan ${10 - valor.length} dígitos (exactamente 10 requeridos).`);
                            } else {
                              setErrorTelefonoCliente('');
                            }
                          }}
                          placeholder="Ej. 3001234567" 
                          className={`w-full bg-[#111111] border p-4 text-[#F5F1E8] placeholder:text-[#555] focus:outline-none ${
                            errorTelefonoCliente ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A227]'
                          }`}
                        />
                        {errorTelefonoCliente && (
                          <p className="text-red-400 text-[10px] mt-1.5 uppercase tracking-wider">{errorTelefonoCliente}</p>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={esDiaDelBarberoBloqueado(barberoElegido.nombre, fechaCita)}
                      className={`w-full py-4 uppercase text-xs tracking-[0.25em] font-semibold transition shadow-xl mt-6 ${
                        esDiaDelBarberoBloqueado(barberoElegido.nombre, fechaCita)
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-[#C9A227] text-black hover:bg-[#E0C36E]'
                      }`}
                    >
                      Confirmar Reserva
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>

          <section id="galeria" className="px-6 md:px-24 py-28 border-b border-[#C9A227]/20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-[0.3em] text-[#C9A227] font-medium block mb-2">Portafolio Visual</span>
                <h2 className="text-4xl md:text-5xl font-normal uppercase tracking-widest text-[#F5F1E8] font-serif">Nuestra Galería de Cortes</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1000&q=80",
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf97Q6xlJTEroFRimN7I5QyL11By-1tR87VvQbpK9Pa1rVxEeuueoASas&s=10",
                  "https://phantom-expansion.unidadeditorial.es/53eb2367c52a8d0ea7f61372f6d5b2c0/crop/26x0/960x1136/resize/828/f/jpg/assets/multimedia/imagenes/2023/09/15/16947630246686.png",
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGvr5MQXNj0yHtAEqP7VX3on991OITKH545IfuPeoo7fJ7P9rREZkYrVHL&s=10"
                ].map((foto, idx) => (
                  <div key={idx} className="relative h-72 md:h-80 overflow-hidden group border border-[#C9A227]/30 shadow-xl bg-[#1A1A1A]">
                    <img src={foto} alt={`Corte de Cabello ${idx + 1}`} className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition duration-700" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="px-6 md:px-24 py-16 bg-[#111111] text-[#A7A39A] text-xs uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#2A2A2A]">
            <div className="font-serif tracking-[0.3em] text-[#F5F1E8] text-base">
              MONARCH<span className="text-[#C9A227]">.</span>
            </div>
            
            <p className="font-light text-center">© 2026 Monarch Barber. Todos los derechos reservados.</p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#C9A227] transition"><Instagram size={18} /></a>
              <a href="#" className="hover:text-[#C9A227] transition"><Facebook size={18} /></a>
              
              <button 
                onClick={() => setVista('login')}
                title="Acceso interno"
                className="text-[#444] hover:text-[#C9A227] transition p-1 ml-2"
              >
                <span className="w-2 h-2 rounded-full bg-current block"></span>
              </button>
            </div>
          </footer>

        </main>
      )}

      {vista === 'admin' && usuarioLogueado && (
        <main className="pt-32 px-6 md:px-16 pb-20 max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1A1A1A] border border-[#C9A227]/20 p-8 shadow-xl gap-4">
            <div>
              <span className="text-[10px] text-[#C9A227] uppercase tracking-[0.3em] font-medium block mb-1">
                {usuarioLogueado.rol === 'admin' ? 'Panel de Administración General' : 'Portal Privado de Barbero'}
              </span>
              <h1 className="text-3xl font-normal font-serif text-[#F5F1E8]">Bienvenido, {usuarioLogueado.nombre}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setVista('cliente')}
                className="border border-[#C9A227]/40 text-[#C9A227] px-5 py-3 uppercase text-[10px] tracking-[0.2em] font-semibold hover:bg-[#C9A227] hover:text-black transition"
              >
                Ver Sitio Web
              </button>
              <button 
                onClick={cerrarSesion}
                className="bg-red-950/60 border border-red-800 text-red-300 px-5 py-3 uppercase text-[10px] tracking-[0.2em] font-semibold hover:bg-red-900 transition flex items-center gap-2"
              >
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A1A] border border-[#C9A227]/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="text-[#C9A227]" size={22} />
                <h2 className="text-xl font-serif text-[#F5F1E8]">Bloquear / Desbloquear Día</h2>
              </div>
              <p className="text-xs text-[#A7A39A] mb-6 font-light">
                {usuarioLogueado.rol === 'admin' 
                  ? 'Selecciona a qué barbero deseas asignarle un día libre.' 
                  : 'Selecciona un día en el que no puedas laborar.'}
              </p>
              
              <form onSubmit={alternarBloqueoDia} className="space-y-4">
                {usuarioLogueado.rol === 'admin' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Seleccionar Barbero</label>
                    <select 
                      value={barberoSeleccionadoBloqueo}
                      onChange={(e) => setBarberoSeleccionadoBloqueo(e.target.value)}
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    >
                      {barberosRegistrados.map(b => (
                        <option key={b.id} value={b.nombre}>{b.nombre} {b.activo === false ? '(Desactivado)' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Fecha (YYYY-MM-DD)</label>
                  <input 
                    type="date" 
                    required
                    min={hoyStr}
                    value={fechaBloqueoInput}
                    onChange={(e) => setFechaBloqueoInput(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <button type="submit" className="w-full bg-[#C9A227] text-black py-3 uppercase text-[10px] tracking-[0.2em] font-semibold hover:bg-[#E0C36E] transition">
                  Alternar Estado del Día
                </button>
              </form>
              
              <div className="mt-6">
                <h3 className="text-xs uppercase tracking-wider text-[#A7A39A] mb-2">Días Bloqueados Registrados:</h3>
                <div className="flex flex-wrap gap-2">
                  {diasBloqueados
                    .filter(d => usuarioLogueado.rol === 'admin' || d.barbero === usuarioLogueado.nombre)
                    .map((d, idx) => (
                      <span key={idx} className="bg-red-950/80 border border-red-800 text-red-300 text-[10px] px-2.5 py-1">
                        {d.barbero}: {formatearFechaLegible(d.fecha)}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#C9A227]/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-[#C9A227]" size={22} />
                <h2 className="text-xl font-serif text-[#F5F1E8]">Gestionar Horarios de Atención</h2>
              </div>
              <p className="text-xs text-[#A7A39A] mb-6 font-light">
                {usuarioLogueado.rol === 'admin'
                  ? 'Asigna o configura los bloques de horas disponibles.' 
                  : 'Visualiza tus horarios de atención configurados.'}
              </p>
              
              {usuarioLogueado.rol === 'admin' && (
                <form onSubmit={agregarHorarioBarbero} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Seleccionar Barbero</label>
                    <select 
                      value={barberoSeleccionadoHorario}
                      onChange={(e) => setBarberoSeleccionadoHorario(e.target.value)}
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    >
                      {barberosRegistrados.map(b => (
                        <option key={b.id} value={b.nombre}>{b.nombre} {b.activo === false ? '(Desactivado)' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Hora y Formato AM / PM</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. 04:30" 
                        value={horaNumericaInput}
                        onChange={(e) => {
                          setHoraNumericaInput(e.target.value);
                          setErrorHorario('');
                        }}
                        className={`w-full bg-[#111111] border p-3 text-xs text-[#F5F1E8] focus:outline-none ${
                          errorHorario ? 'border-red-500' : 'border-[#2A2A2A] focus:border-[#C9A227]'
                        }`}
                      />
                      <select 
                        value={ampmInput}
                        onChange={(e) => setAmpmInput(e.target.value)}
                        className="bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#C9A227] font-semibold focus:outline-none focus:border-[#C9A227]"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <button type="submit" className="bg-[#C9A227] text-black px-5 py-3 uppercase text-[10px] tracking-[0.2em] font-semibold hover:bg-[#E0C36E] transition shrink-0">
                        Añadir Hora
                      </button>
                    </div>
                    {errorHorario && (
                      <p className="text-red-400 text-[10px] uppercase tracking-wider mt-1">{errorHorario}</p>
                    )}
                  </div>
                </form>
              )}

              <div>
                <h3 className="text-xs uppercase tracking-wider text-[#A7A39A] mb-2">
                  {usuarioLogueado.rol === 'admin' ? `Horarios para: ${barberoSeleccionadoHorario}` : 'Tus Horarios Habilitados:'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(horariosPersonalizados[usuarioLogueado.rol === 'admin' ? barberoSeleccionadoHorario : usuarioLogueado.nombre] || HORAS_DISPONIBLES_DEFAULT).map((h, idx) => (
                    <span key={idx} className="bg-[#111111] border border-[#C9A227]/40 text-[#C9A227] text-[10px] px-3 py-1 flex items-center gap-2">
                      {h}
                      {usuarioLogueado.rol === 'admin' && (
                        <button onClick={() => eliminarHorarioBarbero(barberoSeleccionadoHorario, h)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {usuarioLogueado.rol === 'admin' && (
            <div className="space-y-12">
              <div className="bg-[#1A1A1A] border border-[#C9A227]/30 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <UserPlus className="text-[#C9A227]" size={24} />
                    <h2 className="text-xl font-serif text-[#F5F1E8]">
                      {modoEdicionId !== null ? 'Editar Cuenta de Barbero' : 'Crear Nueva Cuenta de Barbero'}
                    </h2>
                  </div>
                  {modoEdicionId !== null && (
                    <button 
                      type="button" 
                      onClick={cancelarEdicion}
                      className="text-xs text-[#A7A39A] hover:text-[#C9A227] underline tracking-wider uppercase"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#A7A39A] mb-6 font-light">
                  {modoEdicionId !== null ? 'Modifica los datos del barbero seleccionado.' : 'Ingresa los datos del barbero.'}
                </p>

                <form onSubmit={guardarOActualizarBarbero} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={nuevoBarberoNombre}
                      onChange={(e) => setNuevoBarberoNombre(e.target.value)}
                      placeholder="Ej. Carlos Mendoza" 
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Correo</label>
                    <input 
                      type="email" 
                      required
                      value={nuevoBarberoEmail}
                      onChange={(e) => setNuevoBarberoEmail(e.target.value)}
                      placeholder="carlos@monarch.com" 
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Teléfono</label>
                    <input 
                      type="text" 
                      required
                      value={nuevoBarberoTel}
                      onChange={(e) => setNuevoBarberoTel(e.target.value)}
                      placeholder="Ej. 3001234567" 
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Años de Experiencia</label>
                    <input 
                      type="text" 
                      required
                      value={nuevoBarberoExperiencia}
                      onChange={(e) => setNuevoBarberoExperiencia(e.target.value)}
                      placeholder="Ej. 5 años" 
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Cargo / Especialidad</label>
                    <input 
                      type="text" 
                      value={nuevoBarberoEspecialidad}
                      onChange={(e) => setNuevoBarberoEspecialidad(e.target.value)}
                      placeholder="Ej. Barbero Senior" 
                      className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">Foto del Barbero</label>
                    <div className="flex items-center gap-3">
                      <label className="w-full bg-[#111111] border border-[#2A2A2A] p-3 text-xs text-[#A7A39A] hover:border-[#C9A227] cursor-pointer flex items-center justify-between transition">
                        <span className="truncate">{nuevoBarberoFoto ? 'Foto cargada con éxito' : 'Seleccionar imagen...'}</span>
                        <Upload size={16} className="text-[#C9A227] shrink-0" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={manejarArchivoFoto}
                          className="hidden"
                        />
                      </label>
                      {nuevoBarberoFoto && (
                        <img src={nuevoBarberoFoto} alt="Preview" className="w-10 h-10 object-cover border border-[#C9A227] shrink-0" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#A7A39A] mb-2 font-medium">
                      {modoEdicionId !== null ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                    </label>
                    <div className="relative">
                      <input 
                        type={mostrarPasswordNuevoBarbero ? "text" : "password"} 
                        {...(modoEdicionId === null ? { required: true } : {})}
                        value={nuevoBarberoPass}
                        onChange={(e) => setNuevoBarberoPass(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#111111] border border-[#2A2A2A] p-3 pr-10 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#C9A227]"
                      />
                      <button 
                        type="button"
                        onClick={() => setMostrarPasswordNuevoBarbero(!mostrarPasswordNuevoBarbero)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7A39A] hover:text-[#C9A227] transition"
                      >
                        {mostrarPasswordNuevoBarbero ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="w-full bg-[#C9A227] text-black py-3 uppercase text-[10px] tracking-[0.2em] font-semibold hover:bg-[#E0C36E] transition">
                      {modoEdicionId !== null ? 'Guardar Cambios' : 'Autorizar Cuenta'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[#1A1A1A] border border-[#C9A227]/20 p-8 shadow-xl overflow-x-auto">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-[#C9A227]" size={22} />
                  <h2 className="text-xl font-serif text-[#F5F1E8]">Lista de Barberos Registrados</h2>
                </div>
                <p className="text-xs text-[#A7A39A] mb-6 font-light">
                  Gestiona, edita, activa/desactiva o elimina las cuentas de los barberos en el sistema.
                </p>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A2A] text-[10px] uppercase tracking-[0.2em] text-[#A7A39A]">
                      <th className="pb-4 font-medium">Barbero</th>
                      <th className="pb-4 font-medium">Correo</th>
                      <th className="pb-4 font-medium">Teléfono</th>
                      <th className="pb-4 font-medium">Estado</th>
                      <th className="pb-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A] text-sm text-[#F5F1E8]">
                    {barberosRegistrados.map((b) => {
                      const estaActivo = b.activo !== false;
                      return (
                        <tr key={b.id} className={`hover:bg-[#111111]/50 transition ${!estaActivo ? 'opacity-60' : ''}`}>
                          <td className="py-4 flex items-center gap-3">
                            <img src={b.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'} alt={b.nombre} className="w-9 h-9 object-cover border border-[#C9A227]/40 rounded-full" />
                            <div>
                              <span className="font-medium block">{b.nombre}</span>
                              <span className="text-[10px] text-[#C9A227]">{b.especialidad || 'Barbero Profesional'}</span>
                            </div>
                          </td>
                          <td className="py-4 text-[#A7A39A] text-xs">{b.email}</td>
                          <td className="py-4 text-[#A7A39A] text-xs">{b.telefono}</td>
                          <td className="py-4">
                            <span className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-sm ${
                              estaActivo ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'
                            }`}>
                              {estaActivo ? 'Activo' : 'Desactivado'}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            <button 
                              onClick={() => prepararEdicionBarbero(b)}
                              className="text-xs bg-[#222222] border border-[#C9A227]/40 text-[#C9A227] px-3 py-1.5 hover:bg-[#C9A227] hover:text-black transition font-medium uppercase tracking-wider inline-flex items-center gap-1.5"
                            >
                              <Edit3 size={13} /> Editar
                            </button>
                            <button 
                              onClick={() => alternarEstadoBarbero(b.id, b.nombre, b.activo)}
                              className={`text-xs border px-3 py-1.5 transition font-medium uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                estaActivo 
                                  ? 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900' 
                                  : 'bg-green-950/60 border-green-700 text-green-300 hover:bg-green-900'
                              }`}
                            >
                              <Power size={13} /> {estaActivo ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-[#1A1A1A] border border-[#C9A227]/20 p-8 shadow-xl overflow-x-auto">
            <h2 className="text-xl font-serif text-[#F5F1E8] mb-2">
              {usuarioLogueado.rol === 'admin' ? 'Todas las Citas de la Tienda' : `Tus Citas Programadas (${usuarioLogueado.nombre})`}
            </h2>
            <p className="text-xs text-[#A7A39A] mb-6 font-light">
              Listado general de reservas confirmadas y agendadas automáticamente.
            </p>

            {citasVisibles.length === 0 ? (
              <div className="text-center py-12 text-[#A7A39A] text-xs uppercase tracking-widest border border-dashed border-[#2A2A2A]">
                No hay citas registradas.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2A2A2A] text-[10px] uppercase tracking-[0.2em] text-[#A7A39A]">
                    <th className="pb-4 font-medium">Cliente</th>
                    <th className="pb-4 font-medium">Teléfono</th>
                    <th className="pb-4 font-medium">Servicio</th>
                    <th className="pb-4 font-medium">Barbero</th>
                    <th className="pb-4 font-medium">Fecha / Hora</th>
                    <th className="pb-4 font-medium">Estado</th>
                    <th className="pb-4 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A] text-sm text-[#F5F1E8]">
                  {citasVisibles.map((cita) => (
                    <tr key={cita.id} className="hover:bg-[#111111]/50 transition">
                      <td className="py-4 font-medium">{cita.usuario || (cita as any).cliente}</td>
                      <td className="py-4 text-[#A7A39A]">{cita.telefono || 'N/A'}</td>
                      <td className="py-4">{cita.servicio}</td>
                      <td className="py-4 text-[#C9A227] font-semibold">{cita.barbero}</td>
                      <td className="py-4 text-xs text-[#A7A39A]">{formatearFechaLegible(cita.fecha)} — {cita.hora}</td>
                      <td className="py-4">
                        <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-sm ${
                          cita.estado === 'Confirmada' ? 'bg-green-950 text-green-400 border border-green-800' :
                          'bg-yellow-950 text-yellow-400 border border-yellow-800'
                        }`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {cita.estado !== 'Cancelada' ? (
                          <button 
                            onClick={() => actualizarEstadoCita(cita.id, 'Cancelada' as any)}
                            className="text-xs bg-red-900/40 border border-red-600 text-red-300 px-3 py-1.5 hover:bg-red-900 transition font-medium uppercase tracking-wider"
                          >
                            Cancelar Cita
                          </button>
                        ) : (
                          <span className="text-xs text-red-400 italic">Cancelada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      )}
  
    </div>
  );
}