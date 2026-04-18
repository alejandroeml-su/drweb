# Avante Backend Migration - Todo

## Overview
Migrate the Avante Bariatric Surgery Platform from localStorage to Atoms Cloud backend with:
- User authentication (login/logout)
- Database for patients and appointments
- Data syncs across all devices

## Database Tables

### 1. patients (create_only=true - each user manages their own patients)
- id: integer (auto-increment)
- user_id: string
- expediente: string (nullable)
- nombre: string
- apellido: string
- edad: integer
- sexo: string
- peso: string
- talla: string
- procedimiento: string
- comorbilidades: string (JSON stringified)
- otros_antecedentes: string
- asa: string
- funcional: string
- telefono: string
- email: string
- medico: string
- medico_id: string
- historia_clinica: string (JSON stringified)
- eoss_metabolico: integer (default 0)
- eoss_mecanico: integer (default 0)
- eoss_psico: integer (default 0)
- created_at: datetime

### 2. appointments (create_only=true - each user manages their own appointments)
- id: integer (auto-increment)
- user_id: string
- paciente_nombre: string
- fecha: string
- tipo: string
- notas: string
- created_at: datetime

## Files to Create/Modify

1. **src/lib/api.ts** - Already exists, client created
2. **src/lib/auth.tsx** - Auth context provider with login/logout
3. **src/App.tsx** - Add routing, auth guard, /auth/callback route
4. **src/modules/Modulo1.tsx** - Migrate patients & appointments from localStorage to backend
5. **src/modules/Modulo0.tsx** - Minor: show login state
6. **src/modules/Modulo2_3.tsx** - Use backend patients
7. **src/modules/Modulo4_5.tsx** - Use backend patients  
8. **src/modules/Modulo6_7_8.tsx** - Use backend patients

## Implementation Strategy
- Create a shared hook `usePatients` in auth.tsx that fetches/caches patients from backend
- Pass patients down through context to avoid prop drilling
- Keep all calculation logic (OS-MRS, EOSS, Caprini, etc.) in data.ts unchanged
- Keep i18n unchanged
- Keep customTitle in localStorage (institution-specific, not user data)