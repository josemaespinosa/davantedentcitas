
function setCookie(nombre, valor, dias) {
  const fecha = new Date();
  fecha.setTime(fecha.getTime() + (dias * 24 * 60 * 60 * 1000));
  document.cookie = `${nombre}=${encodeURIComponent(valor)};expires=${fecha.toUTCString()};path=/`;
}

function getCookie(nombre) {
  const partes = document.cookie.split("; ");
  for (const item of partes) {
    const [k, v] = item.split("=");
    if (k === nombre) return decodeURIComponent(v || "");
  }
  return null;
}

/***********************
 *  POO: Clase Cita
 ***********************/
class Cita {
  constructor({ fechaCita, horaCita, nombre, apellidos, dni, telefono, fechaNacimiento, observaciones }) {
    // Identificador único: instante de grabación + un extra para evitar colisión
    this.id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    this.fechaCita = fechaCita;
    this.horaCita = horaCita;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.dni = dni;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.observaciones = observaciones;
  }
}

/***********************
 *  Selectores
 ***********************/
const vistas = {
  home: document.getElementById("view-home"),
  form: document.getElementById("view-form"),
  list: document.getElementById("view-list"),
};

const btnGoForm = document.getElementById("btn-go-form");
const btnGoList = document.getElementById("btn-go-list");
const btnVolver = document.getElementById("btn-volver");
const btnInicio = document.getElementById("btn-inicio");
const btnNueva = document.getElementById("btn-nueva");
const btnExportar = document.getElementById("btn-exportar");

const form = document.getElementById("form-cita");
const msgForm = document.getElementById("msg-form");
const btnGuardar = document.getElementById("btn-guardar");

const citaId = document.getElementById("citaId");
const fechaCita = document.getElementById("fechaCita");
const horaCita = document.getElementById("horaCita");
const nombre = document.getElementById("nombre");
const apellidos = document.getElementById("apellidos");
const dni = document.getElementById("dni");
const telefono = document.getElementById("telefono");
const fechaNacimiento = document.getElementById("fechaNacimiento");
const observaciones = document.getElementById("observaciones");

const tbody = document.getElementById("tbody-citas");

/***********************
 *  Almacenamiento en cookie
 ***********************/
const COOKIE_NAME = "citasDavanteDent";
const COOKIE_DAYS = 30;

function cargarCitas() {
  const data = getCookie(COOKIE_NAME);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function guardarCitas(lista) {
  setCookie(COOKIE_NAME, JSON.stringify(lista), COOKIE_DAYS);
}

/***********************
 *  Vistas
 ***********************/
function showView(which) {
  Object.values(vistas).forEach(v => v.classList.remove("is-active"));
  vistas[which].classList.add("is-active");
  msgForm.textContent = "";
}

function limpiarFormulario() {
  form.reset();
  citaId.value = "";
  btnGuardar.textContent = "Guardar cita";
  msgForm.textContent = "";
  limpiarErrores();
}

/***********************
 *  Validación
 ***********************/
function normalizarDni(valor) {
  return (valor || "").trim().toUpperCase();
}

function dniValido(valor) {
  return /^[0-9]{8}[A-Z]$/.test(normalizarDni(valor));
}

function telefonoValido(valor) {
  return /^[0-9]{9,15}$/.test((valor || "").trim());
}

function setError(input, errorId, texto) {
  input.classList.add("input-error");
  const el = document.getElementById(errorId);
  if (el) el.textContent = texto;
}

function clearError(input, errorId) {
  input.classList.remove("input-error");
  const el = document.getElementById(errorId);
  if (el) el.textContent = "";
}

function limpiarErrores() {
  clearError(fechaCita, "err-fechaCita");
  clearError(horaCita, "err-horaCita");
  clearError(nombre, "err-nombre");
  clearError(apellidos, "err-apellidos");
  clearError(dni, "err-dni");
  clearError(telefono, "err-telefono");
  clearError(fechaNacimiento, "err-fechaNacimiento");
  clearError(observaciones, "err-observaciones");
}

function validarFormulario() {
  limpiarErrores();

  let ok = true;

  if (!fechaCita.value) { setError(fechaCita, "err-fechaCita", "Selecciona una fecha."); ok = false; }
  if (!horaCita.value) { setError(horaCita, "err-horaCita", "Selecciona una hora."); ok = false; }

  if (!nombre.value.trim()) { setError(nombre, "err-nombre", "El nombre es obligatorio."); ok = false; }
  if (!apellidos.value.trim()) { setError(apellidos, "err-apellidos", "Los apellidos son obligatorios."); ok = false; }

  const dniNorm = normalizarDni(dni.value);
  if (!dniNorm) { setError(dni, "err-dni", "El DNI es obligatorio."); ok = false; }
  else if (!dniValido(dniNorm)) { setError(dni, "err-dni", "Formato: 8 números y 1 letra (12345678A)."); ok = false; }

  const tel = telefono.value.trim();
  if (!tel) { setError(telefono, "err-telefono", "El teléfono es obligatorio."); ok = false; }
  else if (!telefonoValido(tel)) { setError(telefono, "err-telefono", "Solo números (9 a 15 dígitos)."); ok = false; }

  if (!fechaNacimiento.value) { setError(fechaNacimiento, "err-fechaNacimiento", "Selecciona la fecha de nacimiento."); ok = false; }

  // Observaciones no obligatorias, pero si hay, limita un poco
  if (observaciones.value.length > 120) {
    setError(observaciones, "err-observaciones", "Máximo 120 caracteres.");
    ok = false;
  }

  return ok;
}

// Validación “por eventos” (al escribir / cambiar)
[
  [fechaCita, "change", () => (fechaCita.value ? clearError(fechaCita, "err-fechaCita") : null)],
  [horaCita, "change", () => (horaCita.value ? clearError(horaCita, "err-horaCita") : null)],
  [nombre, "input", () => (nombre.value.trim() ? clearError(nombre, "err-nombre") : null)],
  [apellidos, "input", () => (apellidos.value.trim() ? clearError(apellidos, "err-apellidos") : null)],
  [dni, "input", () => {
    const v = normalizarDni(dni.value);
    if (!v) return;
    if (dniValido(v)) clearError(dni, "err-dni");
  }],
  [telefono, "input", () => {
    const v = telefono.value.trim();
    if (!v) return;
    if (telefonoValido(v)) clearError(telefono, "err-telefono");
  }],
  [fechaNacimiento, "change", () => (fechaNacimiento.value ? clearError(fechaNacimiento, "err-fechaNacimiento") : null)],
  [observaciones, "input", () => (observaciones.value.length <= 120 ? clearError(observaciones, "err-observaciones") : null)],
].forEach(([el, ev, fn]) => el.addEventListener(ev, fn));

/***********************
 *  Tabla
 ***********************/
function renderTabla() {
  const lista = cargarCitas();

  // Si no hay citas: mostrar fila “Dato vacío”
  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">Dato vacío</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  lista.forEach((cita, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${cita.dni}</td>
      <td>${cita.nombre} ${cita.apellidos}</td>
      <td>${cita.fechaCita}</td>
      <td>${cita.horaCita}</td>
      <td>${cita.telefono}</td>
      <td>${cita.observaciones || ""}</td>
      <td><button class="badge badge-edit" data-edit="${cita.id}">Editar</button></td>
      <td><button class="badge badge-del" data-del="${cita.id}">Borrar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/***********************
 *  CRUD
 ***********************/
function cargarCitaEnFormularioPorId(id) {
  // Importante: cargar desde cookie (no desde HTML)
  const lista = cargarCitas();
  const cita = lista.find(c => c.id === id);
  if (!cita) return;

  citaId.value = cita.id;            // oculto
  fechaCita.value = cita.fechaCita;
  horaCita.value = cita.horaCita;
  nombre.value = cita.nombre;
  apellidos.value = cita.apellidos;
  dni.value = cita.dni;
  telefono.value = cita.telefono;
  fechaNacimiento.value = cita.fechaNacimiento;
  observaciones.value = cita.observaciones || "";

  btnGuardar.textContent = "Guardar cambios";
  msgForm.textContent = "";
  limpiarErrores();
}

function existeDuplicada(lista, data, idActual) {
  // Evita duplicado: mismo DNI + misma fecha + misma hora
  return lista.some(c =>
    c.id !== idActual &&
    c.dni === data.dni &&
    c.fechaCita === data.fechaCita &&
    c.horaCita === data.horaCita
  );
}

/***********************
 *  Export CSV
 ***********************/
function exportarCSV() {
  const lista = cargarCitas();
  if (lista.length === 0) return;

  const cabecera = ["ORDEN","DNI","NOMBRE_COMPLETO","FECHA","HORA","TELEFONO","OBSERVACIONES"];
  const filas = lista.map((c, i) => ([
    i + 1,
    c.dni,
    `${c.nombre} ${c.apellidos}`,
    c.fechaCita,
    c.horaCita,
    c.telefono,
    (c.observaciones || "").replaceAll('"', '""')
  ]));

  const csv = [cabecera, ...filas]
    .map(r => r.map(v => `"${String(v)}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "citas_davantedent.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/***********************
 *  Eventos UI
 ***********************/
btnGoForm.addEventListener("click", () => {
  limpiarFormulario();
  showView("form");
});

btnGoList.addEventListener("click", () => {
  renderTabla();
  showView("list");
});

btnVolver.addEventListener("click", () => showView("home"));
btnInicio.addEventListener("click", () => showView("home"));

btnNueva.addEventListener("click", () => {
  limpiarFormulario();
  showView("form");
});

btnExportar.addEventListener("click", exportarCSV);

// Submit: crear o editar sin perder lo introducido si hay errores
form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgForm.textContent = "";

  if (!validarFormulario()) {
    msgForm.textContent = "Revisa los campos marcados en rojo.";
    return;
  }

  const lista = cargarCitas();

  const data = {
    fechaCita: fechaCita.value,
    horaCita: horaCita.value,
    nombre: nombre.value.trim(),
    apellidos: apellidos.value.trim(),
    dni: normalizarDni(dni.value),
    telefono: telefono.value.trim(),
    fechaNacimiento: fechaNacimiento.value,
    observaciones: observaciones.value.trim(),
  };

  const idActual = (citaId.value || "").trim();

  if (existeDuplicada(lista, data, idActual)) {
    msgForm.textContent = "Ya existe una cita para ese DNI en esa fecha y hora.";
    setError(dni, "err-dni", "DNI repetido con misma fecha/hora.");
    return;
  }

  if (!idActual) {
    // Crear
    const nueva = new Cita(data);
    lista.push(nueva);
    guardarCitas(lista);
  } else {
    // Editar (mantener mismo id)
    const idx = lista.findIndex(c => c.id === idActual);
    if (idx === -1) {
      msgForm.textContent = "No se encontró la cita para editar.";
      return;
    }
    lista[idx] = { ...lista[idx], ...data, id: idActual };
    guardarCitas(lista);
  }

  limpiarFormulario();
  renderTabla();
  showView("list");
});

// Click en tabla: editar / borrar
tbody.addEventListener("click", (e) => {
  const idEdit = e.target?.dataset?.edit;
  const idDel = e.target?.dataset?.del;

  if (idEdit) {
    cargarCitaEnFormularioPorId(idEdit);
    showView("form");
  }

  if (idDel) {
    const ok = confirm("¿Quieres borrar esta cita?");
    if (!ok) return;

    const lista = cargarCitas().filter(c => c.id !== idDel);
    guardarCitas(lista);
    renderTabla();
  }
});

/***********************
 *  Inicio: cargar tabla si entras directo al listado
 ***********************/
showView("home");
