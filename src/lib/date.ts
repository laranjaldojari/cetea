// Utilidades de data para o calendário (semana inicia na segunda-feira).

export const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function inicioDoDia(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

export function inicioDaSemana(d: Date) {
  const x = inicioDoDia(d);
  const diaSemana = (x.getDay() + 6) % 7; // 0 = segunda
  x.setDate(x.getDate() - diaSemana);
  return x;
}

export function diasDaSemana(d: Date) {
  const ini = inicioDaSemana(d);
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(ini); x.setDate(ini.getDate() + i); return x; });
}

export function gradeDoMes(d: Date) {
  const primeiro = new Date(d.getFullYear(), d.getMonth(), 1);
  const ini = inicioDaSemana(primeiro);
  return Array.from({ length: 42 }, (_, i) => { const x = new Date(ini); x.setDate(ini.getDate() + i); return x; });
}

export const mesmasData = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const horas = (de = 7, ate = 19) => Array.from({ length: ate - de + 1 }, (_, i) => de + i);

export const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

// Combina dia + hora num ISO local (sem deslocamento de fuso indesejado)
export function comHora(dia: Date, hora: number, min = 0) {
  const x = new Date(dia); x.setHours(hora, min, 0, 0); return x;
}

// Para <input type="datetime-local"> (string local sem segundos)
export function paraInputLocal(d: Date) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}
