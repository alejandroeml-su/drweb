import React, { useState, useEffect, useMemo } from 'react';
import { Activity, GraduationCap, Heart, FlaskConical, BarChart3, Users, Download, Share2, Mail, Sparkles, ChevronRight, FileText, Filter, Lightbulb, Database, Plus, Trash2, Search, Copy, Percent, TrendingUp } from 'lucide-react';
import { exportarPDF, descargarPDF, enviarPDFWhatsApp, enviarPDFEmail, storageGet, storageSet, fmtFechaHora } from './src_shared/utils.js';
import { useLang } from './src_shared/i18n.jsx';

const C = { navy:'#0A1F44', teal:'#1A8B9D', gold:'#C9A961', cream:'#FAF7F2', green:'#2D8659', yellow:'#E0A82E', red:'#C0392B' };
const PROCS = { sleeve:'Manga Gástrica', rygb:'RYGB', oagb:'OAGB', sadis:'SADI-S', bpdds:'BPD-DS', balon:'Balón intragástrico', rev_sg_rygb:'Rev. Manga→RYGB', rev_sg_oagb:'Rev. Manga→OAGB' };

function imc(p){const pe=parseFloat(p.peso),t=parseFloat(p.talla)/100;return (pe&&t)?pe/(t*t):0;}

// ===================== Biblioteca estadística inline =====================
// Descriptores
function mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:0;}
function variance(a){if(a.length<2)return 0;const m=mean(a);return a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1);}
function sd(a){return Math.sqrt(variance(a));}
function median(a){if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);const n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;}

// log Gamma (Lanczos)
function gammaln(x){
  const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.001208650973866179,-0.000005395239384953];
  let y=x, tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp);
  let ser=1.000000000190015;
  for(let j=0;j<6;j++){y+=1; ser+=c[j]/y;}
  return -tmp+Math.log(2.5066282746310005*ser/x);
}
// Gamma incompleta regularizada P(a,x)
function gser(a,x){let ap=a,sum=1/a,del=sum; for(let n=1;n<=200;n++){ap+=1; del*=x/ap; sum+=del; if(Math.abs(del)<Math.abs(sum)*1e-12)break;} return sum*Math.exp(-x+a*Math.log(x)-gammaln(a));}
function gcf(a,x){const FPMIN=1e-300; let b=x+1-a,c=1/FPMIN,d=1/b,h=d; for(let i=1;i<=200;i++){const an=-i*(i-a); b+=2; d=an*d+b; if(Math.abs(d)<FPMIN)d=FPMIN; c=b+an/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; const del=d*c; h*=del; if(Math.abs(del-1)<1e-12)break;} return Math.exp(-x+a*Math.log(x)-gammaln(a))*h;}
function gammap(a,x){if(x<0||a<=0)return 0; return x<a+1?gser(a,x):1-gcf(a,x);}
// Beta incompleta regularizada I_x(a,b)
function betacf(a,b,x){const FPMIN=1e-300; const qab=a+b,qap=a+1,qam=a-1; let c=1,d=1-qab*x/qap; if(Math.abs(d)<FPMIN)d=FPMIN; d=1/d; let h=d; for(let m=1;m<=200;m++){const m2=2*m; let aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; h*=d*c; aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<FPMIN)d=FPMIN; c=1+aa/c; if(Math.abs(c)<FPMIN)c=FPMIN; d=1/d; const del=d*c; h*=del; if(Math.abs(del-1)<1e-12)break;} return h;}
function betai(a,b,x){if(x<=0||x>=1)return x<=0?0:1; const bt=Math.exp(gammaln(a+b)-gammaln(a)-gammaln(b)+a*Math.log(x)+b*Math.log(1-x)); return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
// Valores p
function tPvalue(t,df){const x=df/(df+t*t); return betai(df/2,0.5,x);}
function fPvalue(F,df1,df2){if(F<=0)return 1; return betai(df2/2,df1/2,df2/(df2+df1*F));}
function chiSqPvalue(x,df){if(x<=0)return 1; return 1-gammap(df/2,x/2);}
// Pruebas
function welchT(a,b){if(a.length<2||b.length<2)return null; const ma=mean(a),mb=mean(b),va=variance(a),vb=variance(b); const se=Math.sqrt(va/a.length+vb/b.length); if(se===0)return null; const t=(ma-mb)/se; const df=Math.pow(va/a.length+vb/b.length,2)/(Math.pow(va/a.length,2)/(a.length-1)+Math.pow(vb/b.length,2)/(b.length-1)); return {t,df,p:tPvalue(t,df),ma,mb,na:a.length,nb:b.length};}
function anovaOneway(groups){const valid=groups.filter(g=>g.length>=2); if(valid.length<2)return null; const N=valid.reduce((s,g)=>s+g.length,0); const gm=valid.reduce((s,g)=>s+g.reduce((a,b)=>a+b,0),0)/N; const ssb=valid.reduce((s,g)=>s+g.length*Math.pow(mean(g)-gm,2),0); const ssw=valid.reduce((s,g)=>s+g.reduce((a,x)=>a+Math.pow(x-mean(g),2),0),0); const df1=valid.length-1,df2=N-valid.length; const msb=ssb/df1,msw=ssw/df2; if(msw===0)return null; const F=msb/msw; return {F,df1,df2,p:fPvalue(F,df1,df2),k:valid.length};}
function pearsonR(x,y){if(x.length!==y.length||x.length<3)return null; const mx=mean(x),my=mean(y); let num=0,dx=0,dy=0; for(let i=0;i<x.length;i++){num+=(x[i]-mx)*(y[i]-my); dx+=Math.pow(x[i]-mx,2); dy+=Math.pow(y[i]-my,2);} if(dx===0||dy===0)return null; const r=num/Math.sqrt(dx*dy); const n=x.length; const t=r*Math.sqrt((n-2)/(1-r*r)); return {r,n,t,df:n-2,p:tPvalue(t,n-2)};}
function chiSquare(table){const rows=table.length; if(rows<2)return null; const cols=table[0].length; if(cols<2)return null; const rs=table.map(r=>r.reduce((a,b)=>a+b,0)); const cs=Array(cols).fill(0); table.forEach(r=>r.forEach((v,j)=>cs[j]+=v)); const n=rs.reduce((a,b)=>a+b,0); if(n===0)return null; let chi=0; for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const e=rs[i]*cs[j]/n; if(e>0)chi+=Math.pow(table[i][j]-e,2)/e;} const df=(rows-1)*(cols-1); return {chi,df,p:chiSqPvalue(chi,df),n};}
function fmtP(p){if(p===null||p===undefined||!isFinite(p))return '—'; if(p<0.001)return 'p<0.001'; return 'p='+p.toFixed(3);}
function normalPDF(x,mu,s){if(s<=0)return 0; return Math.exp(-0.5*Math.pow((x-mu)/s,2))/(s*Math.sqrt(2*Math.PI));}

// Variables disponibles para los análisis
const VARS_NUM = [
  { k:'edad', l:'Edad (años)', fn:(p)=>parseFloat(p.edad) },
  { k:'imc', l:'IMC basal', fn:(p)=>imc(p) },
  { k:'peso', l:'Peso basal (kg)', fn:(p)=>parseFloat(p.peso) },
  { k:'talla', l:'Talla (cm)', fn:(p)=>parseFloat(p.talla) },
  { k:'imc_ult', l:'IMC último seguimiento', fn:(p,segs)=>{const ss=(segs||{})[p.id]||[]; if(!ss.length)return NaN; const pe=parseFloat(ss[ss.length-1].peso),ta=parseFloat(p.talla)/100; return (pe&&ta)?pe/(ta*ta):NaN;} },
  { k:'twl', l:'%TWL último seguimiento', fn:(p,segs)=>{const ss=(segs||{})[p.id]||[]; if(!ss.length)return NaN; const pi=parseFloat(p.peso),pa=parseFloat(ss[ss.length-1].peso); return (pi&&pa)?((pi-pa)/pi)*100:NaN;} },
  { k:'hba1c_ult', l:'HbA1c último seguimiento', fn:(p,segs)=>{const ss=(segs||{})[p.id]||[]; if(!ss.length)return NaN; return parseFloat(ss[ss.length-1].hba1c);} }
];
const VARS_CAT = [
  { k:'sexo', l:'Sexo', fn:p=>p.sexo||null },
  { k:'procedimiento', l:'Procedimiento', fn:p=>p.procedimiento||null, labels:PROCS },
  { k:'dm', l:'DM2', fn:p=>{const c=p.comorbilidades||{}; return (c.dm||c.dm2)?'Sí':'No';} },
  { k:'hta', l:'HTA', fn:p=>{const c=p.comorbilidades||{}; return c.hta?'Sí':'No';} },
  { k:'aos', l:'AOS', fn:p=>{const c=p.comorbilidades||{}; return c.aos?'Sí':'No';} },
  { k:'erge', l:'ERGE', fn:p=>{const c=p.comorbilidades||{}; return c.erge?'Sí':'No';} }
];

// ---------- Gráfico campana (histograma + normal superpuesta) ----------
function BellChart({groups, colors, varLabel, width=520, height=240}){
  const allData = groups.flatMap(g=>g.data);
  if(allData.length<2) return <div className="p-3 text-xs text-gray-500">Datos insuficientes para graficar.</div>;
  const mn=Math.min(...allData), mx=Math.max(...allData);
  const pad=Math.max((mx-mn)*0.1,1);
  const xMin=mn-pad, xMax=mx+pad;
  const nBins=Math.max(5, Math.min(15, Math.ceil(Math.log2(allData.length)+1)));
  const binW=(xMax-xMin)/nBins;
  const hists=groups.map(g=>{const bins=Array(nBins).fill(0); g.data.forEach(x=>{let i=Math.floor((x-xMin)/binW); if(i===nBins)i=nBins-1; if(i>=0&&i<nBins)bins[i]+=1;}); return bins;});
  const nPts=80;
  const curves=groups.map(g=>{const pts=[]; for(let i=0;i<=nPts;i++){const x=xMin+(xMax-xMin)*i/nPts; const y=g.data.length*binW*normalPDF(x,g.mean,g.sd); pts.push([x,y]);} return pts;});
  const maxY=Math.max(...hists.flat(), ...curves.flatMap(pts=>pts.map(([,y])=>y)), 1);
  const padL=42,padR=16,padT=12,padB=32;
  const W=width-padL-padR, H=height-padT-padB;
  const xs=x=>padL+(x-xMin)/(xMax-xMin)*W;
  const ys=y=>padT+H-y/maxY*H;
  return (
    <svg width={width} height={height} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:4,maxWidth:'100%'}}>
      <line x1={padL} y1={padT+H} x2={padL+W} y2={padT+H} stroke="#94a3b8"/>
      <line x1={padL} y1={padT} x2={padL} y2={padT+H} stroke="#94a3b8"/>
      {[0,0.25,0.5,0.75,1].map(t=>{const xv=xMin+(xMax-xMin)*t; return (<g key={'x'+t}><line x1={xs(xv)} y1={padT+H} x2={xs(xv)} y2={padT+H+4} stroke="#94a3b8"/><text x={xs(xv)} y={padT+H+16} fontSize="9" textAnchor="middle" fill="#64748b">{xv.toFixed(1)}</text></g>);})}
      {[0,0.5,1].map(t=>{const yv=maxY*t; return (<g key={'y'+t}><line x1={padL-4} y1={ys(yv)} x2={padL} y2={ys(yv)} stroke="#94a3b8"/><text x={padL-6} y={ys(yv)+3} fontSize="9" textAnchor="end" fill="#64748b">{yv.toFixed(0)}</text></g>);})}
      {groups.map((g,gi)=>hists[gi].map((cnt,bi)=>{const x0=xs(xMin+bi*binW),x1=xs(xMin+(bi+1)*binW); return cnt>0?<rect key={gi+'-'+bi} x={x0+1} y={ys(cnt)} width={Math.max(x1-x0-2,1)} height={ys(0)-ys(cnt)} fill={colors[gi%colors.length]} opacity={0.2}/>:null;}))}
      {curves.map((pts,gi)=>{const path=pts.map((p,i)=>(i===0?'M':'L')+xs(p[0])+','+ys(p[1])).join(' '); return <path key={'c'+gi} d={path} fill="none" stroke={colors[gi%colors.length]} strokeWidth="2"/>;})}
      <text x={padL+W/2} y={height-4} fontSize="10" textAnchor="middle" fill="#475569">{varLabel}</text>
    </svg>
  );
}

// ---------- Gráfico de dispersión + recta de regresión ----------
function ScatterChart({pairs, xLabel, yLabel, width=520, height=280}){
  if(pairs.length<2) return <div className="p-3 text-xs text-gray-500">Datos insuficientes.</div>;
  const xs_=pairs.map(p=>p[0]), ys_=pairs.map(p=>p[1]);
  const xMin=Math.min(...xs_), xMax=Math.max(...xs_), yMin=Math.min(...ys_), yMax=Math.max(...ys_);
  const xPad=(xMax-xMin)*0.05||1, yPad=(yMax-yMin)*0.05||1;
  const padL=50,padR=16,padT=12,padB=38;
  const W=width-padL-padR, H=height-padT-padB;
  const sx=x=>padL+((x-xMin+xPad)/((xMax-xMin)+2*xPad))*W;
  const sy=y=>padT+H-((y-yMin+yPad)/((yMax-yMin)+2*yPad))*H;
  const mx=mean(xs_), my=mean(ys_);
  let num=0,den=0; for(let i=0;i<xs_.length;i++){num+=(xs_[i]-mx)*(ys_[i]-my); den+=Math.pow(xs_[i]-mx,2);}
  const slope=den?num/den:0, intercept=my-slope*mx;
  return (
    <svg width={width} height={height} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:4,maxWidth:'100%'}}>
      <line x1={padL} y1={padT+H} x2={padL+W} y2={padT+H} stroke="#94a3b8"/>
      <line x1={padL} y1={padT} x2={padL} y2={padT+H} stroke="#94a3b8"/>
      {[0,0.25,0.5,0.75,1].map(t=>{const xv=xMin+(xMax-xMin)*t; return (<text key={'x'+t} x={sx(xv)} y={padT+H+14} fontSize="9" textAnchor="middle" fill="#64748b">{xv.toFixed(1)}</text>);})}
      {[0,0.5,1].map(t=>{const yv=yMin+(yMax-yMin)*t; return (<text key={'y'+t} x={padL-6} y={sy(yv)+3} fontSize="9" textAnchor="end" fill="#64748b">{yv.toFixed(1)}</text>);})}
      {pairs.map((p,i)=><circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={3} fill="#1A8B9D" opacity={0.6}/>)}
      <line x1={sx(xMin)} y1={sy(slope*xMin+intercept)} x2={sx(xMax)} y2={sy(slope*xMax+intercept)} stroke="#C9A961" strokeWidth={2}/>
      <text x={padL+W/2} y={height-6} fontSize="10" textAnchor="middle" fill="#475569">{xLabel}</text>
      <text x={14} y={padT+H/2} fontSize="10" textAnchor="middle" fill="#475569" transform={`rotate(-90 14 ${padT+H/2})`}>{yLabel}</text>
    </svg>
  );
}

// Catálogo de variables cruzadas (keys de avante_marcables) que el módulo analiza
const VARIABLES = [
  { k:'eras_preop', fuente:'Módulo 2', l:'Indicaciones ERAS preoperatorio', color:C.teal },
  { k:'labs_preop', fuente:'Módulo 2', l:'Laboratorios / gabinete preoperatorio', color:C.teal },
  { k:'profilaxis_tev', fuente:'Módulo 2', l:'Profilaxis TEV', color:C.teal },
  { k:'postop_24h', fuente:'Módulo 3', l:'Indicaciones postop 24h', color:C.gold },
  { k:'farmacos_postop', fuente:'Módulo 3', l:'Fármacos postoperatorios', color:C.gold },
  { k:'vitaminas', fuente:'Módulo 3', l:'Vitaminas y suplementos', color:C.gold },
  { k:'farmacos_obesidad', fuente:'Módulo 4', l:'Fármacos antiobesidad', color:C.green },
  { k:'glp1_elegido', fuente:'Módulo 4', l:'GLP-1 / GIP-GLP-1 elegido', color:C.green },
  { k:'balon_elegido', fuente:'Módulo 4', l:'Balón intragástrico elegido', color:C.green }
];

// Variables del registro institucional (importadas desde el Módulo 6)
const VARIABLES_REGISTRO = [
  {cat:'Demográficas',vars:'Edad, sexo, etnia, ocupación, nivel educativo'},
  {cat:'Antropométricas',vars:'Peso, talla, IMC, circunferencia abdominal, % grasa corporal'},
  {cat:'Comorbilidades',vars:'DM2 (HbA1c), HTA, AOS, ERGE, dislipidemia, NASH, SOP, depresión'},
  {cat:'Quirúrgicas',vars:'Procedimiento, duración, sangrado, técnica antirreflujo, drenajes'},
  {cat:'Postoperatorias',vars:'Estancia, Clavien-Dindo, reingreso, reintervención, mortalidad'},
  {cat:'Seguimiento',vars:'Peso a 1/3/6/12/24/60m, %PEP, %PTP, remisión, déficits'},
  {cat:'PROMs',vars:'BAROS, IWQOL-Lite, SF-36, satisfacción'},
  {cat:'Específicas Avante',vars:'TAP + bloqueo visceral autonómico, GLP-1 puente'}
];

const LINEAS_INVESTIGACION_DEFAULT = [
  'TAP block + bloqueo visceral autonómico en cirugía bariátrica',
  'Coledocolitiasis post-bariátrica: incidencia y manejo',
  'GLP-1 como puente preoperatorio en IMC≥50',
  'Resultados a largo plazo de manga vs RYGB en población centroamericana',
  'NASH/MAFLD pre y postoperatorio',
  'Costo-efectividad de la cirugía bariátrica en sistema privado salvadoreño'
];

// Sencillo análisis cruzado (heredado de Mod 6) - descriptores rápidos
function analisisCruzado(pacientes, segs){
  const out = [];
  if(!pacientes || pacientes.length===0) return [{cruce:'Sin datos', valor:'—'}];
  const i = pacientes.map(p=>imc(p)).filter(x=>x>0);
  const mediaIMC = i.length?(i.reduce((a,b)=>a+b,0)/i.length):0;
  out.push({cruce:'IMC preoperatorio medio', valor: mediaIMC.toFixed(1)});
  const edades = pacientes.map(p=>parseFloat(p.edad)).filter(x=>!isNaN(x));
  out.push({cruce:'Edad media', valor: edades.length?(edades.reduce((a,b)=>a+b,0)/edades.length).toFixed(1)+' a':'—'});
  const sexM = pacientes.filter(p=>p.sexo==='M').length;
  const sexF = pacientes.filter(p=>p.sexo==='F').length;
  out.push({cruce:'Distribución sexo', valor:`M ${sexM} · F ${sexF}`});
  const procs = {};
  pacientes.forEach(p=>{if(p.procedimiento){procs[p.procedimiento]=(procs[p.procedimiento]||0)+1;}});
  out.push({cruce:'Distribución procedimiento', valor: Object.entries(procs).map(([k,v])=>`${PROCS[k]||k}:${v}`).join(' · ')||'—'});
  const dm = pacientes.filter(p=>p.comorbilidades&&(p.comorbilidades.dm||p.comorbilidades.dm2)).length;
  out.push({cruce:'DM2 preoperatoria', valor: `${dm}/${pacientes.length} (${pacientes.length?((dm/pacientes.length)*100).toFixed(1):0}%)`});
  let twlSuma=0, twlN=0;
  pacientes.forEach(p=>{
    const ss = (segs||{})[p.id];
    if(ss && ss.length){
      const ult = ss[ss.length-1];
      const pi=parseFloat(p.peso), pa=parseFloat(ult.peso);
      if(pi && pa){ twlSuma += ((pi-pa)/pi)*100; twlN++; }
    }
  });
  out.push({cruce:'%PTP medio (seguidos)', valor: twlN?(twlSuma/twlN).toFixed(1)+'%':'—'});
  return out;
}

// Generador estilo Vancouver - plantilla auto-rellenada con datos reales
function generarBorradorArticulo(titulo, pacientes, segs, lineasEvidencia){
  const anoHoy = new Date().getFullYear();
  const n = pacientes ? pacientes.length : 0;
  const cruces = analisisCruzado(pacientes, segs);
  const tabla = cruces.map(c=>`  - ${c.cruce}: ${c.valor}`).join('\n');
  return `BORRADOR DE ARTÍCULO CIENTÍFICO · ESTILO VANCOUVER
Título: ${titulo}
Autores: Henríquez A, et al.
Institución: Avante Complejo Hospitalario, San Salvador, El Salvador
Año: ${anoHoy}

RESUMEN
Antecedentes: La obesidad es una pandemia con morbimortalidad creciente y la cirugía bariátrica es el tratamiento más efectivo a largo plazo [1,2]. Se presentan resultados preliminares del registro institucional Avante.

Métodos: Estudio retrospectivo observacional del registro prospectivo de pacientes sometidos a cirugía bariátrica en Avante Complejo Hospitalario. Variables demográficas, antropométricas, quirúrgicas y de seguimiento. Análisis descriptivo.

Resultados: n=${n} pacientes.
${tabla}

Discusión: Los hallazgos son coherentes con la literatura internacional [3-5]. Se destaca la incorporación de bloqueo visceral autonómico combinado con TAP block como parte del protocolo ERAS. Limitaciones: tamaño muestral, seguimiento heterogéneo.

Conclusión: La implementación de un protocolo estandarizado con documentación digital y clasificaciones predictivas (MAGKOS-Aminian, MACE, SPLENDID, ADAMS/SM-BOSS, BWTP, SleevePass) permite mejorar la toma de decisiones y medir resultados.

REFERENCIAS (estilo Vancouver, completar):
1. Schauer PR, et al. Bariatric surgery vs intensive medical therapy in obese patients with diabetes. N Engl J Med. 2012;366:1567-76.
2. Adams TD, et al. Weight and metabolic outcomes 12 years after gastric bypass. N Engl J Med. 2017;377:1143-55.
3. Salminen P, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss at 5 years (SLEEVEPASS). JAMA. 2018;319:241-54.
4. Peterli R, et al. Effect of laparoscopic sleeve gastrectomy vs laparoscopic Roux-en-Y gastric bypass on weight loss in patients with morbid obesity: the SM-BOSS randomized clinical trial. JAMA. 2018;319:255-65.
5. Aminian A, et al. Long-term relationship between weight loss, insulin resistance and diabetes remission after bariatric surgery. JAMA Surg. 2020;155:e200087.

${lineasEvidencia.map((l,i)=>`${i+6}. ${l}`).join('\n')}

NOTA: Este borrador se genera automáticamente como punto de partida. La revisión metodológica, análisis estadístico formal y validación de las referencias deben realizarse por el investigador principal antes del envío.`;
}

// ---------- Motor de recomendaciones por marcables ----------
function recomendarEstudios(stats, nPacientes){
  const recs = [];
  const top = (k,n=3)=>Object.entries(stats[k]||{}).sort((a,b)=>b[1]-a[1]).slice(0,n);

  const glpTop = top('glp1_elegido',3);
  if(glpTop.length){
    recs.push({
      titulo:'Comparativo de efectividad entre GLP-1/GIP-GLP-1 seleccionados',
      detalle:`Se observa uso recurrente de ${glpTop.map(([id,c])=>`${id} (n=${c})`).join(', ')}. Diseño sugerido: cohorte retrospectiva comparando %TWL a 6 y 12 meses entre moléculas, controlando por IMC basal y DM2.`,
      diseño:'Cohorte retrospectiva · ajuste por IMC, edad, sexo, HbA1c',
      outcome:'%TWL, cambio HbA1c, efectos adversos GI, adherencia'
    });
  }
  const balTop = top('balon_elegido',3);
  if(balTop.length){
    recs.push({
      titulo:'Elección de balón intragástrico y pérdida ponderal a 6-12 meses',
      detalle:`Distribución observada: ${balTop.map(([id,c])=>`${id} (n=${c})`).join(', ')}. Diseño: comparación de pérdida %TBWL, retiro precoz e intolerancia.`,
      diseño:'Cohorte retrospectiva single-arm por marca · Kaplan-Meier para retiro precoz',
      outcome:'%TBWL, tasa de retiro precoz, náusea/vómito severo'
    });
  }
  const farmTop = top('farmacos_obesidad',5);
  if(farmTop.length>=2){
    recs.push({
      titulo:'Patrones de prescripción antiobesidad y comorbilidades',
      detalle:`Se identificaron ${farmTop.length} moléculas con ≥1 uso. Explorar asociación entre fármaco elegido y comorbilidades basales (DM2, ECV, ERC).`,
      diseño:'Análisis transversal · prueba χ² / regresión logística',
      outcome:'Probabilidad de recibir fármaco X dada comorbilidad Y'
    });
  }
  const vitTop = top('vitaminas',5);
  if(vitTop.length){
    recs.push({
      titulo:'Adherencia a suplementación por técnica quirúrgica',
      detalle:`Vitaminas más indicadas: ${vitTop.map(([id,c])=>`${id} (${c})`).join(', ')}. Contrastar con tipo de procedimiento (manga vs bypass vs SADI-S).`,
      diseño:'Cohorte retrospectiva · ANOVA por técnica',
      outcome:'Deficiencias a 6-12 meses (B12, hierro, vit D, zinc)'
    });
  }
  const erasTop = top('eras_preop',5);
  if(erasTop.length){
    recs.push({
      titulo:'Implementación de ERAS preoperatorio y estancia hospitalaria',
      detalle:`Elementos ERAS más indicados: ${erasTop.map(([id,c])=>`${id} (${c})`).join(', ')}. Correlacionar con estancia hospitalaria y readmisión 30d.`,
      diseño:'Cohorte prospectiva · análisis de regresión',
      outcome:'Estancia (h), readmisión 30d, dolor postop, morbilidad Clavien-Dindo'
    });
  }
  const labTop = top('labs_preop',5);
  if(labTop.length){
    recs.push({
      titulo:'Panel preoperatorio óptimo — costo vs. rendimiento diagnóstico',
      detalle:`Estudios más solicitados: ${labTop.map(([id,c])=>`${id} (${c})`).join(', ')}. Evaluar cuántos modificaron conducta quirúrgica.`,
      diseño:'Auditoría retrospectiva · análisis de costo-efectividad',
      outcome:'Cambio de conducta, costo por caso, estudios redundantes'
    });
  }
  const profTop = top('profilaxis_tev',3);
  if(profTop.length){
    recs.push({
      titulo:'Estrategia de profilaxis TEV y eventos trombóticos/hemorrágicos',
      detalle:`Protocolos usados: ${profTop.map(([id,c])=>`${id} (${c})`).join(', ')}. Comparar incidencia de TEP/TVP vs. sangrado.`,
      diseño:'Cohorte retrospectiva · razón riesgo-beneficio',
      outcome:'Incidencia TEP/TVP, sangrado mayor, score Caprini'
    });
  }
  if(!recs.length){
    recs.push({
      titulo:'Aún no hay datos suficientes',
      detalle:`Marque indicaciones, fármacos o estudios en los módulos 2-4 para activar el motor de recomendación (actualmente ${nPacientes} paciente${nPacientes===1?'':'s'} con registros).`,
      diseño:'—',
      outcome:'—'
    });
  }
  return recs;
}

export default function Modulo9(){
  const { t } = useLang();
  const [modo,setModo]=useState('clinico');
  const [tab,setTab]=useState('marcables');
  const [pacientes,setPacientes]=useState([]);
  const [segs,setSegs]=useState({});
  const [marcables,setMarcables]=useState({});
  const [farmacosCustom,setFarmacosCustom]=useState([]);
  const [lineas,setLineas]=useState(LINEAS_INVESTIGACION_DEFAULT);
  const [nuevaLinea,setNuevaLinea]=useState('');
  const [tituloArticulo,setTituloArticulo]=useState('Resultados a corto plazo de un protocolo perioperatorio estandarizado en cirugía bariátrica: experiencia Avante');
  const [consulta,setConsulta]=useState({sexo:'', procedimiento:'', dm:'', hta:'', aos:'', imcMin:'', imcMax:'', edadMin:'', edadMax:''});
  const [investigPacId,setInvestigPacId]=useState('');
  const [filtroProc,setFiltroProc]=useState('todos');
  const [pacienteFocus,setPacienteFocus]=useState(null);
  const [estMode,setEstMode]=useState('distrib');
  const [estVarX,setEstVarX]=useState('imc');
  const [estVarY,setEstVarY]=useState('twl');
  const [estGrupo,setEstGrupo]=useState('');
  const [estCatX,setEstCatX]=useState('procedimiento');
  const [estCatY,setEstCatY]=useState('dm');
  const [cargando,setCargando]=useState(true);

  useEffect(()=>{(async()=>{
    setPacientes(await storageGet('avante_pacientes')||[]);
    setSegs(await storageGet('avante_seguimientos')||{});
    setMarcables(await storageGet('avante_marcables')||{});
    setFarmacosCustom(await storageGet('avante_farmacos_custom')||[]);
    setLineas(await storageGet('avante_lineas_investig')||LINEAS_INVESTIGACION_DEFAULT);
    setCargando(false);
  })();},[]);

  const agregarLinea=async()=>{
    if(!nuevaLinea.trim())return;
    const act=[...lineas,nuevaLinea.trim()];
    setLineas(act); await storageSet('avante_lineas_investig',act); setNuevaLinea('');
  };
  const eliminarLinea=async(i)=>{
    const act=lineas.filter((_,j)=>j!==i);
    setLineas(act); await storageSet('avante_lineas_investig',act);
  };
  const copiar=(txt)=>{navigator.clipboard.writeText(txt); alert('Copiado');};

  // ------- Apartado marcables: cohorte filtrada por procedimiento -------
  const pacientesFiltrados = useMemo(()=>{
    if(filtroProc==='todos') return pacientes;
    return pacientes.filter(p=>p.procedimiento===filtroProc);
  },[pacientes,filtroProc]);

  const stats = useMemo(()=>{
    const out = {};
    VARIABLES.forEach(v=>{out[v.k]={};});
    pacientesFiltrados.forEach(p=>{
      const m = marcables[p.id]||{};
      VARIABLES.forEach(v=>{
        (m[v.k]||[]).forEach(id=>{
          out[v.k][id] = (out[v.k][id]||0)+1;
        });
      });
    });
    return out;
  },[pacientesFiltrados,marcables]);

  const nConRegistro = useMemo(()=>pacientesFiltrados.filter(p=>{
    const m=marcables[p.id]||{};
    return VARIABLES.some(v=>(m[v.k]||[]).length>0);
  }).length,[pacientesFiltrados,marcables]);

  const recs = useMemo(()=>recomendarEstudios(stats,nConRegistro),[stats,nConRegistro]);

  // ------- Apartado cohorte clásica (heredado de Mod 6) -------
  const cruces = useMemo(()=>analisisCruzado(pacientes, segs),[pacientes,segs]);
  const cumpleFiltros=(p)=>{
    const f=consulta;
    if(f.sexo && p.sexo!==f.sexo) return false;
    if(f.procedimiento && p.procedimiento!==f.procedimiento) return false;
    const c=p.comorbilidades||{};
    if(f.dm==='si' && !c.dm && !c.dm2) return false;
    if(f.dm==='no' && (c.dm||c.dm2)) return false;
    if(f.hta==='si' && !c.hta) return false;
    if(f.hta==='no' && c.hta) return false;
    if(f.aos==='si' && !c.aos) return false;
    if(f.aos==='no' && c.aos) return false;
    const i=imc(p);
    if(f.imcMin && i<parseFloat(f.imcMin)) return false;
    if(f.imcMax && i>parseFloat(f.imcMax)) return false;
    const ed=parseFloat(p.edad);
    if(f.edadMin && (!isFinite(ed)||ed<parseFloat(f.edadMin))) return false;
    if(f.edadMax && (!isFinite(ed)||ed>parseFloat(f.edadMax))) return false;
    return true;
  };
  const resultadosConsulta = pacientes.filter(cumpleFiltros);
  const crucesFiltro = useMemo(()=>analisisCruzado(resultadosConsulta, segs),[resultadosConsulta,segs]);
  const pacInd = pacientes.find(x=>x.id===investigPacId);
  const segInd = pacInd?((segs||{})[pacInd.id]||[]):[];

  // ------- PDFs -------
  const construirPDFMarcables=()=>{
    const secciones = [];
    secciones.push({
      titulo:'Cohorte analizada (marcables)',
      lineas:[
        `Pacientes totales: ${pacientes.length}`,
        `Procedimiento filtrado: ${filtroProc==='todos'?'Todos':PROCS[filtroProc]||filtroProc}`,
        `Pacientes en el filtro: ${pacientesFiltrados.length}`,
        `Pacientes con marcables: ${nConRegistro}`
      ]
    });
    VARIABLES.forEach(v=>{
      const entries = Object.entries(stats[v.k]||{}).sort((a,b)=>b[1]-a[1]);
      if(entries.length===0) return;
      secciones.push({
        titulo:`${v.l} (${v.fuente})`,
        lineas: entries.map(([id,n])=>`• ${id} — ${n} paciente${n===1?'':'s'} (${(n/Math.max(pacientesFiltrados.length,1)*100).toFixed(0)}%)`)
      });
    });
    secciones.push({
      titulo:'Recomendaciones de investigación',
      lineas: recs.flatMap(r=>[`▶ ${r.titulo}`,`  ${r.detalle}`,`  Diseño: ${r.diseño}`,`  Outcome: ${r.outcome}`,''])
    });
    return exportarPDF({
      titulo:'Módulo 9 · Investigación (marcables)',
      subtitulo:`Cohorte · ${filtroProc==='todos'?'toda la muestra':PROCS[filtroProc]||filtroProc}`,
      secciones, footer:'Avante · Módulo 9 · Investigación'
    });
  };
  const pdfArticulo=()=>{
    const txt = generarBorradorArticulo(tituloArticulo, pacientes, segs, lineas);
    return exportarPDF({
      titulo:'Borrador científico (Vancouver)',
      subtitulo:tituloArticulo,
      secciones:[{titulo:'Borrador',lineas:txt.split('\n')}],
      footer:'Avante · Investigación'
    });
  };

  const nomArchivo=()=>`investigacion_avante_${filtroProc==='todos'?'cohorte':filtroProc}`;
  const descargar=()=>descargarPDF(construirPDFMarcables(),nomArchivo());
  const whatsapp=()=>enviarPDFWhatsApp(construirPDFMarcables(),nomArchivo(),'','Reporte de investigación Avante');
  const email=()=>enviarPDFEmail(construirPDFMarcables(),nomArchivo(),'','Reporte de investigación Avante','Adjunto análisis agregado');

  const btn="px-4 py-2 rounded font-medium transition-colors";
  if(cargando)return <div className="p-8 text-center">Cargando...</div>;

  // Vista enfocada por paciente (marcables)
  if(pacienteFocus){
    const m = marcables[pacienteFocus.id]||{};
    const variablesMarc = VARIABLES.filter(v=>(m[v.k]||[]).length>0);
    return (
      <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div style={{background:C.navy,color:'white'}} className="p-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-2xl font-bold">Investigación Avante</h1>
                <p className="text-sm opacity-80 mt-1">Variables marcadas · {pacienteFocus.nombre} {pacienteFocus.apellido}</p>
              </div>
              <button onClick={()=>setPacienteFocus(null)} className={btn+" text-sm"} style={{background:'rgba(255,255,255,0.15)',color:'white'}}>← Volver a cohorte</button>
            </div>
          </div>
          <div className="p-6">
            {variablesMarc.length===0 ? (
              <div className="p-6 rounded text-center text-gray-600" style={{background:C.cream}}>Este paciente aún no tiene variables marcables registradas en los módulos 2, 3 o 4.</div>
            ) : (
              <div className="space-y-3">
                {variablesMarc.map(v=>(
                  <div key={v.k} className="p-3 rounded border-l-4" style={{background:'white',borderColor:v.color}}>
                    <div className="font-bold text-sm" style={{color:C.navy}}>{v.l} <span className="text-xs italic text-gray-500">· {v.fuente}</span></div>
                    <ul className="mt-2 text-xs text-gray-700 space-y-0.5">
                      {(m[v.k]||[]).map(id=>(<li key={id}>• {id}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background:'#f3f4f6',fontFamily:'system-ui,sans-serif'}}>
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div style={{background:C.navy,color:'white'}} className="p-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 style={{fontFamily:'Georgia,serif',color:C.gold}} className="text-3xl font-bold">Avante Complejo Hospitalario</h1>
              <p style={{fontFamily:'Georgia,serif'}} className="text-sm italic mt-1">{t('app.lema')}</p>
              <p className="text-xs mt-2 opacity-80">{t('modulo')} 9 · Investigación</p>
            </div>
            <div className="flex gap-2">
              {[{id:'clinico',i:Activity,k:'modo.clinico'},{id:'academico',i:GraduationCap,k:'modo.academico'},{id:'paciente',i:Heart,k:'modo.paciente'}].map(m=>{
                const I=m.i;
                return <button key={m.id} onClick={()=>setModo(m.id)} className={btn+" flex items-center gap-2 text-sm"}
                  style={{background:modo===m.id?C.teal:'rgba(255,255,255,0.1)',color:'white'}}><I size={16}/>{t(m.k)}</button>;
              })}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-1 mb-2 border-b overflow-x-auto">
            {[
              {id:'marcables',i:BarChart3,l:'Marcables cruzados'},
              {id:'cohorte',i:Users,l:'Cohorte & cruces'},
              {id:'estadistica',i:TrendingUp,l:'Estadística (curva · p)'},
              {id:'consulta',i:Search,l:'Consulta cruzada'},
              {id:'paciente',i:FileText,l:'Datos por paciente'},
              {id:'lineas',i:FlaskConical,l:'Líneas de investigación'},
              {id:'borrador',i:Sparkles,l:'Borrador Vancouver'}
            ].map(tb=>{
              const I=tb.i;
              return <button key={tb.id} onClick={()=>setTab(tb.id)} className="px-3 py-2 flex items-center gap-1 text-sm font-medium border-b-2 whitespace-nowrap"
                style={{borderColor:tab===tb.id?C.gold:'transparent',color:tab===tb.id?C.navy:'#6b7280'}}><I size={14}/>{tb.l}</button>;
            })}
          </div>

          {tab==='marcables' && (
            <div className="space-y-4">
              <div className="p-4 rounded border-l-4 flex items-start gap-3" style={{background:C.cream,borderColor:C.gold}}>
                <FlaskConical size={22} style={{color:C.gold,flexShrink:0,marginTop:2}}/>
                <div className="text-sm text-gray-700">
                  <div className="font-bold" style={{color:C.navy}}>Motor de investigación cruzado por marcables</div>
                  <div className="mt-1">
                    Agrega todas las variables marcables de los módulos 2 (ERAS, laboratorios, profilaxis),
                    3 (indicaciones postop, fármacos, vitaminas) y 4 (fármacos antiobesidad, GLP-1 y balón intragástrico).
                    Filtre por procedimiento para obtener frecuencias y recomendaciones.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Filter size={16} style={{color:C.navy}}/>
                <label className="text-xs font-bold" style={{color:C.navy}}>Filtro por procedimiento</label>
                <select value={filtroProc} onChange={e=>setFiltroProc(e.target.value)} className="px-2 py-1 rounded border text-sm">
                  <option value="todos">Todos los procedimientos</option>
                  {Object.entries(PROCS).map(([k,v])=>(<option key={k} value={k}>{v}</option>))}
                </select>
                <div className="ml-auto flex gap-2 flex-wrap">
                  <button onClick={descargar} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF</button>
                  <button onClick={whatsapp} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:'#25D366'}}><Share2 size={14}/>WhatsApp</button>
                  <button onClick={email} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Mail size={14}/>Email</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.teal}}>
                  <div className="text-xs text-gray-500">Pacientes totales</div>
                  <div className="text-2xl font-bold" style={{color:C.navy}}>{pacientes.length}</div>
                </div>
                <div className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.gold}}>
                  <div className="text-xs text-gray-500">En el filtro</div>
                  <div className="text-2xl font-bold" style={{color:C.navy}}>{pacientesFiltrados.length}</div>
                </div>
                <div className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.green}}>
                  <div className="text-xs text-gray-500">Con marcables</div>
                  <div className="text-2xl font-bold" style={{color:C.navy}}>{nConRegistro}</div>
                </div>
                <div className="p-3 rounded border-l-4" style={{background:'white',borderColor:C.yellow}}>
                  <div className="text-xs text-gray-500">Variables activas</div>
                  <div className="text-2xl font-bold" style={{color:C.navy}}>{VARIABLES.filter(v=>Object.keys(stats[v.k]||{}).length>0).length}/{VARIABLES.length}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm flex items-center gap-2" style={{color:C.navy}}><BarChart3 size={14}/>Frecuencias agregadas por variable</h3>
                <div className="space-y-3">
                  {VARIABLES.map(v=>{
                    const entries = Object.entries(stats[v.k]||{}).sort((a,b)=>b[1]-a[1]);
                    const max = entries.length ? entries[0][1] : 0;
                    return (
                      <div key={v.k} className="p-3 rounded border" style={{background:'white',borderColor:v.color}}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <div className="font-bold text-sm" style={{color:v.color}}>{v.l}</div>
                            <div className="text-xs text-gray-500">{v.fuente} · variable <code>{v.k}</code></div>
                          </div>
                          <div className="text-xs text-gray-600">{entries.length} ítem{entries.length===1?'':'s'} · total de selecciones {entries.reduce((s,[,n])=>s+n,0)}</div>
                        </div>
                        {entries.length===0 ? (
                          <div className="text-xs text-gray-500 italic">Sin registros en esta variable para el filtro actual.</div>
                        ) : (
                          <div className="space-y-1">
                            {entries.slice(0,10).map(([id,n])=>{
                              const pct = pacientesFiltrados.length ? Math.round(n/pacientesFiltrados.length*100) : 0;
                              return (
                                <div key={id} className="flex items-center gap-2">
                                  <div className="text-xs font-mono flex-shrink-0 w-40 truncate" title={id}>{id}</div>
                                  <div className="flex-1 bg-gray-100 rounded overflow-hidden h-4 relative">
                                    <div className="h-4" style={{width: (max?n/max*100:0)+'%', background:v.color}}/>
                                    <div className="absolute inset-0 flex items-center px-1 text-[10px] font-bold text-white mix-blend-difference">
                                      n={n} · {pct}%
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {entries.length>10 && <div className="text-xs text-gray-500 italic">+ {entries.length-10} ítems adicionales (ver PDF)</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm flex items-center gap-2" style={{color:C.navy}}><Lightbulb size={14}/>Estudios recomendados por IA clínica</h3>
                <div className="space-y-2">
                  {recs.map((r,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                      <div className="font-bold text-sm" style={{color:C.navy}}>{r.titulo}</div>
                      <div className="text-xs text-gray-700 mt-1">{r.detalle}</div>
                      {r.diseño!=='—' && <div className="text-xs mt-1"><strong>Diseño:</strong> {r.diseño}</div>}
                      {r.outcome!=='—' && <div className="text-xs"><strong>Outcome:</strong> {r.outcome}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm flex items-center gap-2" style={{color:C.navy}}><Users size={14}/>Pacientes del filtro ({pacientesFiltrados.length})</h3>
                {pacientesFiltrados.length===0 ? (
                  <div className="p-4 rounded text-center text-sm text-gray-600" style={{background:C.cream}}>Sin pacientes para el filtro seleccionado.</div>
                ) : (
                  <div className="space-y-1">
                    {pacientesFiltrados.map(p=>{
                      const m=marcables[p.id]||{};
                      const total=VARIABLES.reduce((s,v)=>s+((m[v.k]||[]).length),0);
                      return (
                        <button key={p.id} onClick={()=>setPacienteFocus(p)} className="w-full p-2 border rounded text-left hover:shadow flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm" style={{color:C.navy}}>{p.nombre||'Sin nombre'} {p.apellido||''}</div>
                            <div className="text-xs text-gray-600">IMC {imc(p).toFixed(1)} · {PROCS[p.procedimiento]||'—'} · {total} marcables</div>
                          </div>
                          <ChevronRight size={16} style={{color:C.teal}}/>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 rounded border-l-4 text-xs text-gray-600" style={{background:C.cream,borderColor:C.navy}}>
                <div className="flex items-start gap-2">
                  <Database size={14} style={{color:C.navy,flexShrink:0,marginTop:2}}/>
                  <div>
                    Todos los datos provienen de <code>localStorage</code> del dispositivo (<code>avante_marcables</code>, <code>avante_pacientes</code>, <code>avante_farmacos_custom</code>, <code>avante_seguimientos</code>, <code>avante_lineas_investig</code>).
                    Para publicar un estudio, exporte el PDF y anonimice antes de compartir. Este motor no envía información a servidores externos.
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='cohorte' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Análisis cruzado automático (toda la cohorte)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {cruces.map((c,i)=>(
                    <div key={i} className="p-3 rounded" style={{background:C.cream}}>
                      <div className="text-xs text-gray-600">{c.cruce}</div>
                      <div className="font-bold" style={{color:C.navy}}>{c.valor}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Variables del registro institucional</h3>
                <div className="space-y-2">
                  {VARIABLES_REGISTRO.map((v,i)=>(
                    <div key={i} className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.teal}}>
                      <div className="font-bold text-sm" style={{color:C.navy}}>{v.cat}</div>
                      <div className="text-xs text-gray-700">{v.vars}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab==='estadistica' && (
            <div className="space-y-4">
              <div className="p-3 rounded border-l-4 flex items-start gap-3" style={{background:C.cream,borderColor:C.gold}}>
                <Percent size={22} style={{color:C.gold,flexShrink:0,marginTop:2}}/>
                <div className="text-sm text-gray-700">
                  <div className="font-bold" style={{color:C.navy}}>Curvas de campana y pruebas de hipótesis</div>
                  <div className="mt-1">
                    Superpone histograma real con la curva normal teórica (media, desviación estándar) de cada grupo.
                    Calcula <strong>t de Welch</strong> (2 grupos), <strong>ANOVA</strong> (3+ grupos), <strong>correlación de Pearson</strong> (numéricas)
                    y <strong>χ² de independencia</strong> (categóricas). Valor p derivado de las distribuciones t, F y χ² sin librerías externas.
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  {k:'distrib', l:'Distribución · comparación de grupos'},
                  {k:'correl', l:'Correlación numérica × numérica'},
                  {k:'tabla', l:'Tabla χ² (categórica × categórica)'}
                ].map(m=>(
                  <button key={m.k} onClick={()=>setEstMode(m.k)} className={btn+" text-xs"} style={{background:estMode===m.k?C.teal:'#e5e7eb',color:estMode===m.k?'white':C.navy}}>{m.l}</button>
                ))}
              </div>

              {estMode==='distrib' && (() => {
                const vx = VARS_NUM.find(v=>v.k===estVarX) || VARS_NUM[0];
                const vg = VARS_CAT.find(v=>v.k===estGrupo);
                const rows = pacientes.map(p=>({x:vx.fn(p,segs), g:vg?vg.fn(p):'Cohorte'})).filter(r=>isFinite(r.x) && r.g!==null);
                if(rows.length<3) return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable numérica</label>
                        <select value={estVarX} onChange={e=>setEstVarX(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_NUM.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Agrupar por</label>
                        <select value={estGrupo} onChange={e=>setEstGrupo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm"><option value="">— sin agrupar —</option>{VARS_CAT.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                    </div>
                    <div className="p-3 rounded text-xs text-gray-500" style={{background:C.cream}}>Se requieren al menos 3 pacientes con la variable registrada.</div>
                  </div>
                );
                let keys;
                if(vg){ keys=[...new Set(rows.map(r=>r.g))]; }
                else { keys=['Cohorte']; }
                const colors=[C.teal,C.gold,C.green,C.red,C.navy,C.yellow];
                const groups = keys.map(k=>{const data=rows.filter(r=>r.g===k).map(r=>r.x); return {name:(vg&&vg.labels&&vg.labels[k])||k, key:k, data, n:data.length, mean:mean(data), sd:sd(data), median:median(data)};}).filter(g=>g.n>=1);
                const twoOrMore = groups.filter(g=>g.n>=2);
                let test=null;
                if(twoOrMore.length===2){const r=welchT(twoOrMore[0].data,twoOrMore[1].data); if(r) test={name:'Prueba t de Welch (dos muestras)', detail:`t=${r.t.toFixed(3)}, gl=${r.df.toFixed(1)}, ${fmtP(r.p)} · Δμ=${(r.ma-r.mb).toFixed(2)}`, p:r.p};}
                else if(twoOrMore.length>=3){const r=anovaOneway(twoOrMore.map(g=>g.data)); if(r) test={name:'ANOVA de una vía', detail:`F=${r.F.toFixed(3)}, gl=${r.df1},${r.df2}, ${fmtP(r.p)} · k=${r.k} grupos`, p:r.p};}
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable numérica</label>
                        <select value={estVarX} onChange={e=>setEstVarX(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_NUM.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Agrupar por</label>
                        <select value={estGrupo} onChange={e=>setEstGrupo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm"><option value="">— sin agrupar (toda la cohorte) —</option>{VARS_CAT.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                    </div>
                    <div className="overflow-x-auto"><BellChart groups={groups} colors={colors} varLabel={vx.l}/></div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      {groups.map((g,i)=>(
                        <div key={g.key} className="flex items-center gap-1">
                          <span className="inline-block w-3 h-3 rounded" style={{background:colors[i%colors.length]}}/>
                          <span>{g.name} (n={g.n}, μ={g.mean.toFixed(2)}, σ={g.sd.toFixed(2)}, med={g.median.toFixed(2)})</span>
                        </div>
                      ))}
                    </div>
                    {test && (
                      <div className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                        <div className="font-bold text-sm flex items-center gap-1" style={{color:C.navy}}><Percent size={14}/>{test.name}</div>
                        <div className="text-xs text-gray-700 mt-1">{test.detail}</div>
                        <div className="text-xs italic mt-1" style={{color:test.p<0.05?C.green:'#6b7280'}}>{test.p<0.05?'Diferencia significativa entre grupos (α=0.05).':'Sin evidencia de diferencia significativa (α=0.05).'}</div>
                      </div>
                    )}
                    {!test && <div className="p-3 rounded text-xs text-gray-500" style={{background:C.cream}}>Se necesitan ≥2 grupos con al menos 2 pacientes cada uno para ejecutar una prueba.</div>}
                  </div>
                );
              })()}

              {estMode==='correl' && (() => {
                const vx = VARS_NUM.find(v=>v.k===estVarX) || VARS_NUM[0];
                const vy = VARS_NUM.find(v=>v.k===estVarY) || VARS_NUM[1];
                const pairs = pacientes.map(p=>[vx.fn(p,segs), vy.fn(p,segs)]).filter(([a,b])=>isFinite(a)&&isFinite(b));
                const res = pearsonR(pairs.map(p=>p[0]), pairs.map(p=>p[1]));
                const fuerza = r=>{const a=Math.abs(r); if(a<0.1)return 'trivial'; if(a<0.3)return 'débil'; if(a<0.5)return 'moderada'; if(a<0.7)return 'fuerte'; return 'muy fuerte';};
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable X</label>
                        <select value={estVarX} onChange={e=>setEstVarX(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_NUM.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable Y</label>
                        <select value={estVarY} onChange={e=>setEstVarY(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_NUM.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                    </div>
                    <div className="overflow-x-auto"><ScatterChart pairs={pairs} xLabel={vx.l} yLabel={vy.l}/></div>
                    {res ? (
                      <div className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                        <div className="font-bold text-sm flex items-center gap-1" style={{color:C.navy}}><Percent size={14}/>Correlación de Pearson</div>
                        <div className="text-xs text-gray-700 mt-1">r={res.r.toFixed(3)}, n={res.n}, t={res.t.toFixed(3)}, gl={res.df}, {fmtP(res.p)}</div>
                        <div className="text-xs italic mt-1" style={{color:res.p<0.05?C.green:'#6b7280'}}>Asociación {fuerza(res.r)} {res.r>0?'positiva':'negativa'} · {res.p<0.05?'significativa (α=0.05)':'no significativa'}.</div>
                      </div>
                    ) : <div className="p-3 rounded text-xs text-gray-500" style={{background:C.cream}}>Se requieren ≥3 pacientes con ambas variables válidas.</div>}
                  </div>
                );
              })()}

              {estMode==='tabla' && (() => {
                const vx = VARS_CAT.find(v=>v.k===estCatX) || VARS_CAT[0];
                const vy = VARS_CAT.find(v=>v.k===estCatY) || VARS_CAT[1];
                const data=pacientes.map(p=>({x:vx.fn(p), y:vy.fn(p)})).filter(r=>r.x!==null&&r.y!==null);
                const rowKeys=[], colKeys=[];
                data.forEach(r=>{ if(!rowKeys.includes(r.x)) rowKeys.push(r.x); if(!colKeys.includes(r.y)) colKeys.push(r.y); });
                const table = rowKeys.map(rx=>colKeys.map(cy=>data.filter(r=>r.x===rx&&r.y===cy).length));
                const test = chiSquare(table);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable de filas</label>
                        <select value={estCatX} onChange={e=>setEstCatX(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_CAT.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                      <div><label className="text-xs font-bold" style={{color:C.navy}}>Variable de columnas</label>
                        <select value={estCatY} onChange={e=>setEstCatY(e.target.value)} className="w-full px-2 py-1 rounded border text-sm">{VARS_CAT.map(v=><option key={v.k} value={v.k}>{v.l}</option>)}</select></div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs border">
                        <thead style={{background:C.navy,color:'white'}}>
                          <tr>
                            <th className="p-2 text-left">{vx.l} ╲ {vy.l}</th>
                            {colKeys.map(c=><th key={c} className="p-2">{(vy.labels&&vy.labels[c])||c}</th>)}
                            <th className="p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rowKeys.map((r,i)=>(
                            <tr key={r} className="border-t">
                              <td className="p-2 font-bold" style={{color:C.navy}}>{(vx.labels&&vx.labels[r])||r}</td>
                              {colKeys.map((c,j)=><td key={c} className="p-2 text-center">{table[i][j]}</td>)}
                              <td className="p-2 text-center font-bold">{table[i].reduce((a,b)=>a+b,0)}</td>
                            </tr>
                          ))}
                          <tr style={{background:'#f8fafc'}}>
                            <td className="p-2 font-bold">Total</td>
                            {colKeys.map((c,j)=><td key={c} className="p-2 text-center font-bold">{rowKeys.reduce((a,_,i)=>a+table[i][j],0)}</td>)}
                            <td className="p-2 text-center font-bold">{data.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {test ? (
                      <div className="p-3 rounded border-l-4" style={{background:C.cream,borderColor:C.gold}}>
                        <div className="font-bold text-sm flex items-center gap-1" style={{color:C.navy}}><Percent size={14}/>χ² de independencia</div>
                        <div className="text-xs text-gray-700 mt-1">χ²={test.chi.toFixed(3)}, gl={test.df}, {fmtP(test.p)}, n={test.n}</div>
                        <div className="text-xs italic mt-1" style={{color:test.p<0.05?C.green:'#6b7280'}}>{test.p<0.05?'Asociación estadísticamente significativa (α=0.05).':'Sin evidencia de asociación con α=0.05.'}</div>
                      </div>
                    ) : <div className="p-3 rounded text-xs text-gray-500" style={{background:C.cream}}>Se requieren al menos 2 categorías en cada variable y datos suficientes.</div>}
                  </div>
                );
              })()}
            </div>
          )}

          {tab==='consulta' && (
            <div className="space-y-4">
              <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-1" style={{color:C.navy}}><Search size={14}/>Consulta cruzada de pacientes</h3>
                <p className="text-xs text-gray-600 mb-2">Filtre la cohorte por criterios clínicos. La tabla muestra los pacientes coincidentes y el bloque siguiente recalcula el análisis cruzado solo para ese subgrupo.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs">Sexo</label>
                    <select value={consulta.sexo} onChange={e=>setConsulta({...consulta,sexo:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"><option value="">—</option><option value="M">M</option><option value="F">F</option></select>
                  </div>
                  <div>
                    <label className="text-xs">Procedimiento</label>
                    <select value={consulta.procedimiento} onChange={e=>setConsulta({...consulta,procedimiento:e.target.value})} className="w-full px-2 py-1 rounded border text-sm">
                      <option value="">—</option>
                      {Object.entries(PROCS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs">DM2</label>
                    <select value={consulta.dm} onChange={e=>setConsulta({...consulta,dm:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select>
                  </div>
                  <div>
                    <label className="text-xs">HTA</label>
                    <select value={consulta.hta} onChange={e=>setConsulta({...consulta,hta:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select>
                  </div>
                  <div>
                    <label className="text-xs">AOS</label>
                    <select value={consulta.aos} onChange={e=>setConsulta({...consulta,aos:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select>
                  </div>
                  <div>
                    <label className="text-xs">IMC ≥</label>
                    <input type="number" step="0.1" value={consulta.imcMin} onChange={e=>setConsulta({...consulta,imcMin:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs">IMC ≤</label>
                    <input type="number" step="0.1" value={consulta.imcMax} onChange={e=>setConsulta({...consulta,imcMax:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs">Edad ≥</label>
                    <input type="number" value={consulta.edadMin} onChange={e=>setConsulta({...consulta,edadMin:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs">Edad ≤</label>
                    <input type="number" value={consulta.edadMax} onChange={e=>setConsulta({...consulta,edadMax:e.target.value})} className="w-full px-2 py-1 rounded border text-sm"/>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>setConsulta({sexo:'',procedimiento:'',dm:'',hta:'',aos:'',imcMin:'',imcMax:'',edadMin:'',edadMax:''})} className="px-3 py-1 rounded text-xs" style={{background:'#e5e7eb'}}>Limpiar filtros</button>
                  <span className="text-xs flex items-center" style={{color:C.navy}}><strong>{resultadosConsulta.length}</strong>&nbsp;de {pacientes.length} pacientes coinciden</span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead style={{background:C.navy,color:'white'}}>
                      <tr>
                        <th className="p-2 text-left">Paciente</th><th className="p-2">Edad</th><th className="p-2">Sexo</th><th className="p-2">IMC</th><th className="p-2">Procedimiento</th><th className="p-2">DM · HTA · AOS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultadosConsulta.length===0 ? (
                        <tr><td colSpan={6} className="p-3 text-center text-gray-500">Sin coincidencias con los filtros actuales.</td></tr>
                      ) : resultadosConsulta.map(p=>{
                        const c=p.comorbilidades||{};
                        return (
                          <tr key={p.id} className="border-t">
                            <td className="p-2 font-bold" style={{color:C.navy}}>{(p.nombre||'')+' '+(p.apellido||'')}</td>
                            <td className="p-2 text-center">{p.edad||'—'}</td>
                            <td className="p-2 text-center">{p.sexo||'—'}</td>
                            <td className="p-2 text-center">{imc(p).toFixed(1)}</td>
                            <td className="p-2">{PROCS[p.procedimiento]||'—'}</td>
                            <td className="p-2 text-center">{(c.dm||c.dm2)?'DM':'—'} · {c.hta?'HTA':'—'} · {c.aos?'AOS':'—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold mb-1" style={{color:C.navy}}>Análisis cruzado del subgrupo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {crucesFiltro.map((c,i)=>(
                      <div key={i} className="p-2 rounded bg-white border">
                        <div className="text-xs text-gray-600">{c.cruce}</div>
                        <div className="font-bold" style={{color:C.navy}}>{c.valor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='paciente' && (
            <div className="space-y-3">
              <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                <h3 className="font-bold text-sm mb-2 flex items-center gap-1" style={{color:C.navy}}><Search size={14}/>Explorar datos individuales</h3>
                <select value={investigPacId} onChange={e=>setInvestigPacId(e.target.value)} className="w-full md:w-80 px-2 py-1 rounded border text-sm">
                  <option value="">— seleccione paciente —</option>
                  {pacientes.map(p=><option key={p.id} value={p.id}>{(p.nombre||'')+' '+(p.apellido||'')}</option>)}
                </select>
                {pacInd && (
                  <div className="mt-3 p-3 rounded bg-white border text-xs space-y-1" style={{color:C.navy}}>
                    <div><strong>Nombre:</strong> {(pacInd.nombre||'')+' '+(pacInd.apellido||'')}</div>
                    <div><strong>Edad:</strong> {pacInd.edad||'—'} · <strong>Sexo:</strong> {pacInd.sexo||'—'} · <strong>IMC basal:</strong> {imc(pacInd).toFixed(1)}</div>
                    <div><strong>Procedimiento:</strong> {PROCS[pacInd.procedimiento]||'—'}</div>
                    <div><strong>Comorbilidades:</strong> {Object.entries(pacInd.comorbilidades||{}).filter(([,v])=>v).map(([k])=>k).join(', ')||'—'}</div>
                    <div><strong>Seguimientos registrados:</strong> {segInd.length}</div>
                    {segInd.length>0 && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-xs border">
                          <thead style={{background:C.navy,color:'white'}}>
                            <tr><th className="p-1">Fecha</th><th className="p-1">Peso</th><th className="p-1">IMC</th><th className="p-1">%PTP</th><th className="p-1">HbA1c</th></tr>
                          </thead>
                          <tbody>
                            {segInd.map((s,i)=>{
                              const pa=parseFloat(s.peso), pi=parseFloat(pacInd.peso), tall=parseFloat(pacInd.talla)/100;
                              const im=(pa&&tall)?(pa/(tall*tall)).toFixed(1):'—';
                              const twl=(pi&&pa)?(((pi-pa)/pi)*100).toFixed(1)+'%':'—';
                              return (
                                <tr key={i} className="border-t">
                                  <td className="p-1 text-center">{s.fecha?fmtFechaHora(s.fecha):'—'}</td>
                                  <td className="p-1 text-center">{s.peso||'—'}</td>
                                  <td className="p-1 text-center">{im}</td>
                                  <td className="p-1 text-center">{twl}</td>
                                  <td className="p-1 text-center">{s.hba1c||'—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab==='lineas' && (
            <div className="space-y-3">
              <h3 className="font-bold mb-2 text-sm" style={{color:C.navy}}>Líneas de investigación (editable)</h3>
              <div className="space-y-1 mb-2">
                {lineas.map((l,i)=>(
                  <div key={i} className="p-2 rounded border flex justify-between items-center">
                    <span className="text-sm flex-1">{l}</span>
                    <button onClick={()=>eliminarLinea(i)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={nuevaLinea} onChange={e=>setNuevaLinea(e.target.value)} placeholder="Nueva línea de investigación" className="flex-1 px-2 py-1 rounded border text-sm"/>
                <button onClick={agregarLinea} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Plus size={14}/>Agregar</button>
              </div>
            </div>
          )}

          {tab==='borrador' && (
            <div className="space-y-3">
              <div className="p-3 rounded border" style={{background:C.cream,borderColor:C.teal}}>
                <h3 className="font-bold text-sm mb-2" style={{color:C.navy}}>Generador de borrador (estilo Vancouver)</h3>
                <input value={tituloArticulo} onChange={e=>setTituloArticulo(e.target.value)} className="w-full px-2 py-1 rounded border text-sm mb-2"/>
                <div className="flex gap-2 flex-wrap mb-2">
                  <button onClick={()=>descargarPDF(pdfArticulo(),'borrador_avante')} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.teal}}><Download size={14}/>PDF del borrador</button>
                  <button onClick={()=>copiar(generarBorradorArticulo(tituloArticulo,pacientes,segs,lineas))} className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.gold}}><Copy size={14}/>Copiar texto</button>
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(tituloArticulo)}`} target="_blank" rel="noopener noreferrer" className={btn+" text-white text-sm flex items-center gap-1"} style={{background:C.navy}}><Search size={14}/>Buscar estudios relacionados en PubMed</a>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto p-2 rounded border bg-white" style={{color:C.navy}}>{generarBorradorArticulo(tituloArticulo,pacientes,segs,lineas)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
