# Plataforma Perioperatoria Bariátrica Avante
## Guía de integración de los 7 módulos

---

## ARQUITECTURA

La plataforma está compuesta por **8 archivos**:

```
avante_plataforma.jsx     ← Shell principal con navegación lateral
avante_modulo1.jsx        ← Estratificación de Riesgo Quirúrgico
avante_modulo2.jsx        ← Optimización + Selección + Profilaxis
avante_modulo3.jsx        ← Seguimiento Postoperatorio
avante_modulo4.jsx        ← Manejo No Quirúrgico, Revisión, Conductual
avante_modulo5.jsx        ← Plástica, Poblaciones, Calidad, Documentación
avante_modulo6.jsx        ← Educación, Costos, Investigación, Emergencias
avante_modulo7.jsx        ← Dashboard Ejecutivo, Telemedicina, Avante Care
```

Todos los módulos comparten datos a través del almacenamiento local del navegador, usando dos claves:
- `avante_pacientes` — base de pacientes (escrita por Módulo 1, leída por todos)
- `avante_seguimientos` — controles ponderales (Módulo 3)

---

## OPCIÓN A — Despliegue completo (recomendado)

Esta es la forma profesional. Crea una aplicación web real que el equipo Avante puede usar desde cualquier navegador.

### Requisitos previos
- Node.js 18 o superior instalado
- Una computadora con conexión a internet (solo para la instalación inicial)

### Pasos

**1. Crear el proyecto**

Abra una terminal y ejecute:

```bash
npm create vite@latest avante-plataforma -- --template react
cd avante-plataforma
npm install
npm install lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

**2. Configurar Tailwind**

Edite el archivo `tailwind.config.js` y reemplace su contenido por:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Edite `src/index.css` y reemplace todo su contenido por:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**3. Copiar los archivos**

Coloque los **8 archivos `.jsx`** dentro de la carpeta `src/`. La estructura debe quedar así:

```
avante-plataforma/
├── src/
│   ├── avante_plataforma.jsx
│   ├── avante_modulo1.jsx
│   ├── avante_modulo2.jsx
│   ├── avante_modulo3.jsx
│   ├── avante_modulo4.jsx
│   ├── avante_modulo5.jsx
│   ├── avante_modulo6.jsx
│   ├── avante_modulo7.jsx
│   ├── main.jsx
│   └── index.css
```

**4. Conectar el shell a la aplicación**

Edite `src/main.jsx` y reemplace su contenido por:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AvantePlataforma from './avante_plataforma'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AvantePlataforma />
  </React.StrictMode>,
)
```

**5. Reemplazar `window.storage` por localStorage**

Los módulos fueron diseñados para Claude.ai, que ofrece `window.storage`. Para que funcionen en una aplicación web normal, en cada uno de los 7 módulos haga este reemplazo simple (puede usar buscar/reemplazar global del editor):

| Buscar | Reemplazar por |
|---|---|
| `await window.storage.get('clave')` | `Promise.resolve({value: localStorage.getItem('clave')})` |
| `await window.storage.set('clave', valor)` | `Promise.resolve(localStorage.setItem('clave', valor))` |

O más simple aún: pegue este bloque al inicio de cada módulo (justo después de los `import`):

```js
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    get: async (k) => ({ value: localStorage.getItem(k) }),
    set: async (k, v) => { localStorage.setItem(k, v); return { value: v }; }
  };
}
```

Con eso los módulos funcionan idénticamente sin tocar nada más.

**6. Ejecutar localmente**

```bash
npm run dev
```

Abra el navegador en la dirección que aparece en pantalla (típicamente `http://localhost:5173`). Verá la plataforma completa con la navegación lateral.

**7. Compilar para producción**

Cuando esté listo para desplegarla en el servidor de Avante:

```bash
npm run build
```

Esto genera una carpeta `dist/` con archivos estáticos que puede subir a cualquier hosting (servidor propio de Avante, Netlify, Vercel, AWS S3, etc.).

---

## OPCIÓN B — Uso directo en Claude.ai

Si prefiere mantenerlo dentro de Claude.ai sin desplegar nada:

1. Cada uno de los 7 módulos ya funciona como artifact independiente.
2. Los datos se comparten automáticamente porque todos leen/escriben al mismo `window.storage` dentro de Claude.
3. Limitación: solo usted (con su sesión) puede ver los datos. No es compartible con su equipo.

Útil para uso personal o demostración. No apto para producción multiusuario.

---

## OPCIÓN C — Servidor compartido para todo el equipo Avante

Para que los datos sean compartidos entre cirujanos, residentes, nutricionistas y coordinación, necesita un backend con base de datos. Esto sí requiere desarrollo adicional:

- Reemplazar `localStorage` por llamadas a una API REST
- Backend en Node.js/Express o Python/FastAPI
- Base de datos PostgreSQL o MongoDB
- Autenticación con roles (cirujano, residente, nutrición, coordinación)
- Cumplimiento de protección de datos médicos

Si decide ir por este camino, los 7 módulos ya están listos: solo hay que cambiar las funciones de `window.storage.get/set` por llamadas `fetch()` a su API. Si quiere que le ayude a especificar la arquitectura del backend, lo armamos en una próxima sesión.

---

## RECOMENDACIÓN FINAL

Para el corto plazo (próximas 2-4 semanas):
- **Opción A** para uso interno suyo y del Dr. Luis Martínez Chávez en computadoras de Avante.

Para el mediano plazo (3-6 meses), si la plataforma demuestra valor:
- **Opción C** integrada al sistema de información hospitalaria de Avante, con autenticación y registro de auditoría.

---

Dr. Ángel Henríquez
Avante Complejo Hospitalario
Creamos e innovamos para cuidar de ti
