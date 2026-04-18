import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { patientsApi, appointmentsApi } from './api';
import { Patient, EMPTY_PATIENT, storageGet, storageSet } from './data';

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  // Patient CRUD via backend
  patients: Patient[];
  patientsLoading: boolean;
  fetchPatients: () => Promise<void>;
  savePatient: (p: Patient) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<void>;
  // Appointments CRUD via backend
  appointments: Appointment[];
  appointmentsLoading: boolean;
  fetchAppointments: () => Promise<void>;
  saveAppointment: (a: Omit<Appointment, 'id'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export interface Appointment {
  id: string;
  paciente_nombre: string;
  fecha: string;
  tipo: string;
  notas: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  patients: [],
  patientsLoading: false,
  fetchPatients: async () => {},
  savePatient: async () => null,
  deletePatient: async () => {},
  appointments: [],
  appointmentsLoading: false,
  fetchAppointments: async () => {},
  saveAppointment: async () => {},
  deleteAppointment: async () => {},
});

// Convert backend record to frontend Patient
function backendToPatient(rec: Record<string, unknown>): Patient {
  let comorbilidades: Record<string, boolean> = {};
  try {
    if (typeof rec.comorbilidades === 'string' && rec.comorbilidades) {
      comorbilidades = JSON.parse(rec.comorbilidades as string);
    }
  } catch { /* noop */ }

  let historiaClinica: Record<string, string> = {};
  try {
    if (typeof rec.historia_clinica === 'string' && rec.historia_clinica) {
      historiaClinica = JSON.parse(rec.historia_clinica as string);
    }
  } catch { /* noop */ }

  return {
    id: String(rec.id ?? ''),
    expediente: (rec.expediente as string) || null,
    nombre: (rec.nombre as string) || '',
    apellido: (rec.apellido as string) || '',
    edad: String(rec.edad ?? ''),
    sexo: (rec.sexo as string) || 'M',
    foto: null,
    telefono: (rec.telefono as string) || '',
    email: (rec.email_paciente as string) || '',
    medico: (rec.medico as string) || '',
    medicoId: (rec.medico_id as string) || '',
    fechaRegistro: (rec.created_at as string) || '',
    peso: (rec.peso as string) || '',
    talla: (rec.talla as string) || '',
    comorbilidades,
    otrosAntecedentes: (rec.otros_antecedentes as string) || '',
    asa: (rec.asa as string) || '2',
    funcional: (rec.funcional as string) || 'independiente',
    procedimiento: (rec.procedimiento as string) || 'sleeve',
    historiaClinica,
    eossMetabolico: Number(rec.eoss_metabolico ?? 0),
    eossMecanico: Number(rec.eoss_mecanico ?? 0),
    eossPsico: Number(rec.eoss_psico ?? 0),
  };
}

// Convert frontend Patient to backend data
function patientToBackend(p: Patient): Record<string, unknown> {
  return {
    expediente: p.expediente || '',
    nombre: p.nombre,
    apellido: p.apellido,
    edad: parseInt(p.edad) || 0,
    sexo: p.sexo,
    peso: p.peso,
    talla: p.talla,
    procedimiento: p.procedimiento,
    comorbilidades: JSON.stringify(p.comorbilidades || {}),
    otros_antecedentes: p.otrosAntecedentes || '',
    asa: p.asa || '2',
    funcional: p.funcional || 'independiente',
    telefono: p.telefono || '',
    email_paciente: p.email || '',
    medico: p.medico || '',
    medico_id: p.medicoId || '',
    historia_clinica: JSON.stringify(p.historiaClinica || {}),
    eoss_metabolico: Number((p as Record<string, unknown>).eossMetabolico ?? 0),
    eoss_mecanico: Number((p as Record<string, unknown>).eossMecanico ?? 0),
    eoss_psico: Number((p as Record<string, unknown>).eossPsico ?? 0),
  };
}

const AUTH_KEY = 'avante_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Check auth on mount — read from localStorage
  useEffect(() => {
    const saved = storageGet(AUTH_KEY) as UserProfile | null;
    if (saved && saved.id) {
      setUser(saved);
    }
    setLoading(false);
  }, []);

  // Simulated login — creates a local user session
  const login = async () => {
    const localUser: UserProfile = {
      id: 'local_user',
      name: 'Usuario Avante',
      email: 'usuario@avante.local',
    };
    storageSet(AUTH_KEY, localUser);
    setUser(localUser);
  };

  const logout = async () => {
    storageSet(AUTH_KEY, null);
    setUser(null);
    setPatients([]);
    setAppointments([]);
  };

  // Fetch patients from Supabase via serverless function
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    setPatientsLoading(true);
    try {
      const res = await patientsApi.list(user.id);
      const items = res?.items || [];
      setPatients(items.map(backendToPatient));
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  }, [user]);

  // Save patient (create or update)
  const savePatient = useCallback(async (p: Patient): Promise<Patient | null> => {
    if (!user) return null;
    try {
      const data = patientToBackend(p);
      let res: Record<string, unknown>;
      if (p.id && patients.find(x => x.id === p.id)) {
        res = await patientsApi.update(p.id, data);
      } else {
        data.user_id = user.id;
        res = await patientsApi.create(data);
      }
      if (res) {
        const saved = backendToPatient(res);
        setPatients(prev => {
          const exists = prev.find(x => x.id === saved.id);
          if (exists) return prev.map(x => x.id === saved.id ? saved : x);
          return [saved, ...prev];
        });
        return saved;
      }
    } catch (err) {
      console.error('Error saving patient:', err);
    }
    return null;
  }, [user, patients]);

  // Delete patient
  const deletePatient = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await patientsApi.delete(id);
      setPatients(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
    }
  }, [user]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setAppointmentsLoading(true);
    try {
      const res = await appointmentsApi.list(user.id);
      const items = res?.items || [];
      setAppointments(items.map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ''),
        paciente_nombre: (r.paciente_nombre as string) || '',
        fecha: (r.fecha as string) || '',
        tipo: (r.tipo as string) || '',
        notas: (r.notas as string) || '',
      })));
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [user]);

  // Save appointment
  const saveAppointment = useCallback(async (a: Omit<Appointment, 'id'>) => {
    if (!user) return;
    try {
      const res = await appointmentsApi.create({
        user_id: user.id,
        paciente_nombre: a.paciente_nombre,
        fecha: a.fecha,
        tipo: a.tipo,
        notas: a.notas,
      });
      if (res) {
        const saved: Appointment = {
          id: String(res.id ?? ''),
          paciente_nombre: (res.paciente_nombre as string) || '',
          fecha: (res.fecha as string) || '',
          tipo: (res.tipo as string) || '',
          notas: (res.notas as string) || '',
        };
        setAppointments(prev => [...prev, saved]);
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
    }
  }, [user]);

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await appointmentsApi.delete(id);
      setAppointments(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  }, [user]);

  // Auto-fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchPatients();
      fetchAppointments();
    }
  }, [user, fetchPatients, fetchAppointments]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      patients, patientsLoading, fetchPatients, savePatient, deletePatient,
      appointments, appointmentsLoading, fetchAppointments, saveAppointment, deleteAppointment,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}