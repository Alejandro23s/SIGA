/**
 * STATE & DATABASE MANAGEMENT
 */
let state = {
    loggedStudent: null,
    currentUserType: null,
    activeDeptName: "Control escolar",
    tramites: [],
    editingTramiteId: null
};

const API_URL = "https://nevada-chargers-evaluated-introduced.trycloudflare.com";

// UI HELPERS
function showToast(msg, icon = "fa-check-circle") {
    const toast = document.getElementById("toast");
    document.getElementById("toast-msg").innerText = msg;
    document.getElementById("toast-icon").className = `fa-solid ${icon} text-amber-400 text-lg`;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

function toggleMenuDrawer() {
    const drawer = document.getElementById("drawer-menu");
    const overlay = document.getElementById("drawer-overlay");
    
    if (drawer.classList.contains("-translate-x-full")) {
        drawer.classList.remove("-translate-x-full");
        overlay.classList.remove("hidden");
    } else {
        drawer.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
    }
}

function setLoginTab(mode) {
    const tabStudent = document.getElementById("tab-login-alumno");
    const tabDept = document.getElementById("tab-login-dept");
    const formStudent = document.getElementById("form-login-alumno");
    const formDept = document.getElementById("form-login-dept");

    if (mode === 'alumno') {
        tabStudent.className = "flex-1 py-3 text-center font-bold text-xs sm:text-sm text-icep-navy border-b-2 border-icep-navy bg-white transition flex items-center justify-center gap-2";
        tabDept.className = "flex-1 py-3 text-center font-bold text-xs sm:text-sm text-slate-500 border-b-2 border-transparent hover:text-icep-navy transition flex items-center justify-center gap-2";
        formStudent.classList.remove("hidden");
        formDept.classList.add("hidden");
    } else {
        tabDept.className = "flex-1 py-3 text-center font-bold text-xs sm:text-sm text-icep-navy border-b-2 border-icep-navy bg-white transition flex items-center justify-center gap-2";
        tabStudent.className = "flex-1 py-3 text-center font-bold text-xs sm:text-sm text-slate-500 border-b-2 border-transparent hover:text-icep-navy transition flex items-center justify-center gap-2";
        formDept.classList.remove("hidden");
        formStudent.classList.add("hidden");
    }
}

// AUTH HANDLERS
async function handleStudentLogin(e) {
    e.preventDefault();
    const matriculaInput = document.getElementById("input-matricula").value.trim();

    if(!matriculaInput) return;
    
    //Buscar al alumno
    try {
        const respuesta = await fetch(
            `${API_URL}/alumnos/${matriculaInput}`
        );
        if (!respuesta.ok) {
            showToast("La matrícula no existe", "fa-triangle-exclamation");
            return;
        }
        const alumno = await respuesta.json();
        state.loggedStudent = {
            id: alumno.ID,
            matricula: alumno.Matricula,
            nombre: alumno.Nombre,
            grupoId: alumno.Grupo_Id
        };
    } catch (error) {
        console.error(error);
        showToast("No se pudo conectar con el servidor", "fa-triangle-exclamation");
        return;
    }

    document.getElementById("user-name-text").innerText = state.loggedStudent.nombre;
    document.getElementById("user-matricula-text").innerText = state.loggedStudent.matricula;

    document.getElementById("drawer-user-name").innerText = state.loggedStudent.nombre;
    document.getElementById("drawer-user-id").innerText = `Matrícula: ${state.loggedStudent.matricula}`;

    document.getElementById("btn-hamburger").classList.remove("hidden");
    document.getElementById("drawer-student-nav").classList.remove("hidden");
    document.getElementById("drawer-dept-nav").classList.add("hidden");

    document.getElementById("view-login").classList.add("hidden");
    switchStudentTab('dashboard');

    showToast(`Bienvenido(a) ${state.loggedStudent.nombre}`);
}

async function handleDeptLogin(e) {
    e.preventDefault();
    const deptName = document.getElementById("select-dept").value;
    const pass = document.getElementById("input-dept-password").value.trim();

    if (pass !== "Admin123") {
        showToast("Contraseña incorrecta.", "fa-triangle-exclamation");
        return;
    }

    state.currentUserType = 'dept';
    state.activeDeptName = deptName;

    document.getElementById("drawer-user-name").innerText = `Resp. ${deptName}`;
    document.getElementById("drawer-user-id").innerText = "Administrador de Departamento";

    document.getElementById("btn-hamburger").classList.remove("hidden");
    document.getElementById("drawer-student-nav").classList.add("hidden");
    document.getElementById("drawer-dept-nav").classList.remove("hidden");

    document.getElementById("view-login").classList.add("hidden");
    document.getElementById("view-student-dashboard").classList.add("hidden");
    document.getElementById("view-student-survey").classList.add("hidden");
    document.getElementById("view-student-realizados").classList.add("hidden");

    document.getElementById("view-dept-dashboard").classList.remove("hidden");
    document.getElementById("dept-title-header").innerText = `MÓDULO DE DEPARTAMENTO: ${deptName.toUpperCase()}`;
    document.getElementById("dept-admin-label").innerText = `Departamento de ${deptName}`;

    await cargarTramites();
    renderDeptTable();

    showToast(`Módulo de ${deptName} iniciado`);
}

function logout() {
    state.currentUserType = null;
    document.getElementById("btn-hamburger").classList.add("hidden");

    document.getElementById("view-student-dashboard").classList.add("hidden");
    document.getElementById("view-student-survey").classList.add("hidden");
    document.getElementById("view-student-realizados").classList.add("hidden");
    document.getElementById("view-dept-dashboard").classList.add("hidden");

    document.getElementById("view-login").classList.remove("hidden");
    showToast("Sesión cerrada correctamente");
}

function goToHome() {
    if (!state.currentUserType) {
        logout();
    } else if (state.currentUserType === 'student') {
        switchStudentTab('dashboard');
    } else {
        goToDeptDashboard();
    }
}

function switchStudentTab(tab) {
    document.getElementById("view-student-dashboard").classList.add("hidden");
    document.getElementById("view-student-survey").classList.add("hidden");
    document.getElementById("view-student-realizados").classList.add("hidden");
    document.getElementById("view-dept-dashboard").classList.add("hidden");

    if (tab === 'dashboard') {
        document.getElementById("view-student-dashboard").classList.remove("hidden");
        renderStudentDashboard();
    } else if (tab === 'realizados') {
        document.getElementById("view-student-realizados").classList.remove("hidden");
        renderRealizadosTable();
    } else if (tab === 'evaluar') {
        document.getElementById("view-student-survey").classList.remove("hidden");
    }
}

function goToDeptDashboard() {
    document.getElementById("view-student-dashboard").classList.add("hidden");
    document.getElementById("view-student-survey").classList.add("hidden");
    document.getElementById("view-student-realizados").classList.add("hidden");
    document.getElementById("view-dept-dashboard").classList.remove("hidden");
    renderDeptTable();
}

async function cargarTramites() {

    try {
        const respuesta = await fetch(`${API_URL}/tramites`);
        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los trámites");
        }
        const tramites = await respuesta.json();
        state.tramites = tramites;
        console.log("Trámites desde MySQL:", tramites);
        return tramites;
    } catch (error) {
        console.error(error);
        showToast("Error al cargar los trámites", "fa-triangle-exclamation");
        console.log("Trámites cargados:", datos);
        return [];
    }
}

async function cargarTramitesCompletados(alumnoId) {
    const respuesta = await fetch(`${API_URL}/estatus/${alumnoId}`);
    const datos = await respuesta.json();

    return datos;
}

// STUDENT DASHBOARD RENDERER
async function renderStudentDashboard() {
    const tramites = await cargarTramites();
    const containerUrgent = document.getElementById("container-urgent");
    const containerUpcoming = document.getElementById("container-upcoming");
    const containerOntime = document.getElementById("container-ontime");

    containerUrgent.innerHTML = "";
    containerUpcoming.innerHTML = "";
    containerOntime.innerHTML = "";

    const realizados = await cargarTramitesCompletados(state.loggedStudent.id);
    console.log("Alumno:", state.loggedStudent);
    console.log("Realizados:", realizados);
    console.log("Trámites:", tramites);
    
    const studentTramites = tramites.filter(t => {
        // Si ya lo realizó este alumno, no mostrarlo
        const yaRealizado = realizados.some(r => r.Tramite_Id === t.id);
        if (yaRealizado) return false;
        // Todos
        if (t.targetAudience === "Todos") {
            return true;
        }
        // Grupo
        if (t.targetAudience === "Grupo") {
            return Number(t.targetGroup) === Number(state.loggedStudent.grupoId);
        }
        // Específico
        if (t.targetAudience === "Especifico") {
            return t.specificMatricula.includes(state.loggedStudent.matricula);
        }
        return false;
    });
    console.log("Trámites que verá:", studentTramites);

    let countUrgent = 0;
    let countUpcoming = 0;
    let countOntime = 0;

    studentTramites.forEach(t => {
        const card = document.createElement("div");
        
        let cardStyle = "";
        let statusBadge = "";

        if (t.urgency === 'urgent') {
            cardStyle = "bg-white p-4 rounded-xl border-l-4 border-l-red-600 border border-red-200 shadow-sm hover:shadow-md transition space-y-3";
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-[11px] font-black bg-red-100 text-red-800 px-2.5 py-1 rounded-md border border-red-200">
                <i class="fa-solid fa-triangle-exclamation text-red-600"></i> ${t.statusText}
            </span>`;
        } else if (t.urgency === 'upcoming') {
            cardStyle = "bg-white p-4 rounded-xl border-l-4 border-l-amber-500 border border-amber-200 shadow-sm hover:shadow-md transition space-y-3";
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-[11px] font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                <i class="fa-solid fa-clock text-amber-600"></i> ${t.statusText}
            </span>`;
        } else {
            cardStyle = "bg-white p-4 rounded-xl border-l-4 border-l-emerald-600 border border-emerald-200 shadow-sm hover:shadow-md transition space-y-3";
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-[11px] font-black bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md border border-emerald-200">
                <i class="fa-solid fa-circle-check text-emerald-600"></i> ${t.statusText}
            </span>`;
        }

        card.className = cardStyle;
        
        card.innerHTML = `
            <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <h4 class="font-extrabold text-slate-800 text-xs leading-snug">${t.title}</h4>
                <span class="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold shrink-0">${t.category}</span>
            </div>
            <p class="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">${t.description}</p>
            <div class="pt-1">
                ${statusBadge}
            </div>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button onclick="openTramiteModal(${t.id})" class="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg transition text-center uppercase">
                    Ver detalles
                </button>
                <button onclick="quickCompleteStudent(${t.id})" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-2 rounded-lg shadow-sm transition text-center uppercase">
                    Completada
                </button>
            </div>
        `;

        if (t.urgency === 'urgent') {
            countUrgent++;
            containerUrgent.appendChild(card);
        } else if (t.urgency === 'upcoming') {
            countUpcoming++;
            containerUpcoming.appendChild(card);
        } else {
            countOntime++;
            containerOntime.appendChild(card);
        }
    });

    if(countUrgent === 0) containerUrgent.innerHTML = '<p class="text-xs text-slate-400 italic p-4 text-center">No hay trámites urgentes</p>';
    if(countUpcoming === 0) containerUpcoming.innerHTML = '<p class="text-xs text-slate-400 italic p-4 text-center">No hay trámites próximos</p>';
    if(countOntime === 0) containerOntime.innerHTML = '<p class="text-xs text-slate-400 italic p-4 text-center">No hay trámites al corriente</p>';

    document.getElementById("count-urgent").innerText = countUrgent;
    document.getElementById("count-upcoming").innerText = countUpcoming;
    document.getElementById("count-ontime").innerText = countOntime;

    document.getElementById("col-urgent-badge").innerText = countUrgent;
    document.getElementById("col-upcoming-badge").innerText = countUpcoming;
    document.getElementById("col-ontime-badge").innerText = countOntime;
}

function filterStudentCards(filter) {
    renderStudentDashboard();
    if (filter === 'all') return;

    const cols = {
        'urgent': document.getElementById("container-urgent").parentElement,
        'upcoming': document.getElementById("container-upcoming").parentElement,
        'ontime': document.getElementById("container-ontime").parentElement
    };

    Object.keys(cols).forEach(k => {
        if (k === filter) {
            cols[k].classList.remove("hidden");
        } else {
            cols[k].classList.add("hidden");
        }
    });
}

// MODAL LOGIC
function openTramiteModal(id) {
    state.selectedTramiteId = id;
    const t = state.tramites.find(item => item.id === id);
    if (!t) return;

    document.getElementById("modal-title").innerText = t.title;
    document.getElementById("modal-category").innerText = `Categoría: ${t.category}`;
    document.getElementById("modal-description").innerText = t.description;
    document.getElementById("modal-deadline").innerText = t.deadlineText;
    document.getElementById("modal-location").innerText = t.location;
    document.getElementById("modal-hours").innerText = "No especificado";
    document.getElementById("modal-responsible").innerText = t.responsible;

    const reqList = document.getElementById("modal-requirements");
    reqList.innerHTML = "";

    // Si viene como texto desde MySQL, convertirlo a arreglo
    const requisitos = Array.isArray(t.requirements)
        ? t.requirements
        : (t.requirements || "").split(",").map(r => r.trim());

    requisitos.forEach(req => {
        const li = document.createElement("li");
        li.className = "flex items-center space-x-2";
        li.innerHTML = `<input type="checkbox" checked class="rounded text-icep-navy focus:ring-icep-navy"> <span class="font-medium">${req}</span>`;
        reqList.appendChild(li);
    });

    const badge = document.getElementById("modal-status-badge");
    if(t.urgency === 'urgent') {
        badge.className = "inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white mb-1.5";
        badge.innerText = "Status: URGENTE";
    } else if(t.urgency === 'upcoming') {
        badge.className = "inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500 text-white mb-1.5";
        badge.innerText = "Status: PRÓXIMO";
    } else {
        badge.className = "inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-600 text-white mb-1.5";
        badge.innerText = "Status: EN TIEMPO";
    }

    document.getElementById("modal-tramite-detail").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-tramite-detail").classList.add("hidden");
    state.selectedTramiteId = null;
}

function markCurrentAsCompleted() {
    if (!state.selectedTramiteId) return;
    quickCompleteStudent(state.selectedTramiteId);
    closeModal();
}

async function quickCompleteStudent(id) {
    const alumnoId = state.loggedStudent.id;
    

    try {
        const respuesta = await fetch(`${API_URL}/estatus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                alumnoId,
                tramiteId: id
            })
        });
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            showToast(datos.mensaje, "fa-circle-exclamation");
            return;
        }
        console.log(datos);
    } catch (error) {
        console.error(error);
        showToast("Error al guardar el trámite");
        return;
    }
    await renderStudentDashboard();
    await renderRealizadosTable();

    showToast("Trámite marcado como realizado", "fa-check-circle");
}

// HISTÓRICO TRÁMITES REALIZADOS
async function renderRealizadosTable() {
    const tbody = document.getElementById("tbody-realizados");
    tbody.innerHTML = "";

    const realizados = await cargarTramitesCompletados(state.loggedStudent.id);
    let list = realizados.map(r => {
        const tramite = state.tramites.find(
            t => t.id === r.Tramite_Id
        );
        if (!tramite) return null;
        return {
            ...tramite,
            completedAt: new Date(r.Fecha_completado).toLocaleString("es-MX")
        };
    }).filter(t => t !== null);

    const searchVal = (document.getElementById("search-realizados")?.value || "").toLowerCase();
    const catVal = document.getElementById("filter-category-realizados")?.value || "Todos";

    if (searchVal) list = list.filter(t => t.title.toLowerCase().includes(searchVal));
    if (catVal !== "Todos") list = list.filter(t => t.category === catVal);

    document.getElementById("total-completed-count").innerText = list.length;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">No se encontraron trámites realizados.</td></tr>`;
        return;
    }

    list.forEach(t => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-3 font-bold text-slate-800">${t.title}</td>
            <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold">${t.category}</span></td>
            <td class="p-3 text-slate-600 font-mono text-[11px]">${t.completedAt || '28/07/26 11:25'}</td>
            <td class="p-3 text-center">
                <button onclick="reopenTramiteAction(${t.id})" class="text-icep-navy font-bold hover:underline bg-slate-100 border border-slate-300 hover:bg-slate-200 px-2.5 py-1 rounded text-[11px]">
                    Reabrir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterRealizadosTable() {
    renderRealizadosTable();
}

async function reopenTramiteAction(id) {

    try {
        const respuesta = await fetch(
            `${API_URL}/estatus/${state.loggedStudent.id}/${id}`,
            {
                method: "DELETE"
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            showToast(datos.mensaje || "Error al reabrir el trámite");
            return;
        }
        await renderRealizadosTable();
        await renderStudentDashboard();
        showToast("Trámite reabierto");
    } catch (error) {
        console.error(error);
        showToast("Error al reabrir el trámite");
    }
}

// DEPARTAMENTO ACTIONS
function toggleMatriculasInput() {
    const audience = document.querySelector(
        'input[name="dept-destinatarios"]:checked'
    ).value;
    const matriculasWrapper = document.getElementById("wrapper-specific-matriculas");
    const groupWrapper = document.getElementById("group-selector-container");

    if (audience === "Todos") {
        matriculasWrapper.classList.add("hidden");
        groupWrapper.classList.add("hidden");
    }
    else if (audience === "Grupo") {
        matriculasWrapper.classList.add("hidden");
        groupWrapper.classList.remove("hidden");
    }
    else {
        matriculasWrapper.classList.remove("hidden");
        groupWrapper.classList.add("hidden");
    }
}

async function handleCreateTramite(e) {
    e.preventDefault();

    const title = document.getElementById("dept-title").value.trim();
    const date = document.getElementById("dept-date").value;
    const time = document.getElementById("dept-time").value;
    const cat = document.getElementById("dept-category").value;
    const audience = document.querySelector('input[name="dept-destinatarios"]:checked').value;
    const targetGroup = document.getElementById("group-selector").value;
    const specificMat = document.getElementById("dept-specific-matriculas")
        .value
        .split(",")
        .map(m => m.trim())
        .filter(m => m !== "");
    const instructions = document.getElementById("dept-instructions").value.trim();
    const location = document.getElementById("dept-location").value.trim() || `Ventanilla ${state.activeDeptName}`;

    if (state.editingTramiteId !== null) {
        let departamentoId = 1;
        if (state.activeDeptName === "Coordinacion academica") {
            departamentoId = 1;
        }
        else if (state.activeDeptName === "Certificacion y Titulacion academica") {
            departamentoId = 2;
        }
        else if (state.activeDeptName === "Finanzas") {
            departamentoId = 3;
        }
        try {
            const respuesta = await fetch(
                `${API_URL}/tramites/${state.editingTramiteId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        departamentoId: departamentoId,
                        categoriaId: Number(cat),
                        titulo: title,
                        descripcion: instructions,
                        requisitos: "Presentar identificación oficial, Documentación en regla",
                        lugarAtencion: location,
                        fechaLimite: `${date} ${time}:00`,
                        targetAudience: audience,
                        targetGroup: audience === "Grupo" ? Number(targetGroup) : null,
                        specificMatricula: audience === "Especifico"
                            ? specificMat.join(",")
                            : ""
                    })
                }
            );
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                showToast(datos.mensaje);
                return;
            }
            showToast(
                "Trámite actualizado correctamente",
                "fa-pen"
            );
            state.tramites = await cargarTramites();
            renderDeptTable();
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar el trámite");
            return;
        }
    } else {
        let departamentoId = 1;
        if (state.activeDeptName === "Coordinacion academica") {
            departamentoId = 1;
        }
        else if (state.activeDeptName === "Certificacion y Titulacion academica") {
            departamentoId = 2;
        }
        else if (state.activeDeptName === "Finanzas") {
            departamentoId = 3;
        }
        try {
            const targetGroup =
            audience === "Grupo"
                ? Number(document.getElementById("group-selector").value)
                : null;
            const respuesta = await fetch(`${API_URL}/tramites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    departamentoId: departamentoId,
                    categoriaId: Number(cat),
                    titulo: title,
                    descripcion: instructions,
                    requisitos: "Presentar identificación oficial, Documentación en regla",
                    lugarAtencion: location,
                    fechaLimite: `${date} ${time}:00`,
                    targetAudience: audience,
                    targetGroup: targetGroup,
                    specificMatricula: specificMat.join(",")
                })
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                showToast(datos.mensaje);
                return;
            }
            showToast(
                "Nuevo trámite registrado exitosamente",
                "fa-plus-circle"
            );
            state.tramites = await cargarTramites();
            renderDeptTable();
        } catch (error) {
            console.error(error);
            showToast("Error al crear el trámite");
            return;
        }

    }

    e.target.reset();
    toggleMatriculasInput();
    state.editingTramiteId = null;
    document.getElementById("btn-save-tramite").innerText =
        "[ GUARDAR TRÁMITE ]";
    renderDeptTable();
}

async function cargarCategorias() {
    const respuesta = await fetch(`${API_URL}/categorias`);
    const categorias = await respuesta.json();
    const select = document.getElementById("dept-category");
    select.innerHTML = "";

    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.ID;
        option.textContent = cat.Nombre;
        select.appendChild(option);

    });

}

async function cargarGrupos() {
    const respuesta = await fetch(`${API_URL}/grupos`);
    const grupos = await respuesta.json();
    const select = document.getElementById("group-selector");
    select.innerHTML = `
        <option value="">Seleccione un grupo</option>
    `;
    grupos.forEach(grupo => {
        const option = document.createElement("option");
        option.value = grupo.ID;
        option.textContent = grupo.Nombre;
        select.appendChild(option);
    });
}


function renderDeptTable() {
    const tbody = document.getElementById("tbody-dept-tramites");
    tbody.innerHTML = "";

    let list = state.tramites;

    const searchVal = (document.getElementById("dept-search")?.value || "").toLowerCase();
    const catVal = document.getElementById("dept-filter-cat")?.value || "Todos";

    if (searchVal) list = list.filter(t => t.title.toLowerCase().includes(searchVal));
    if (catVal !== "Todos") list = list.filter(t => t.category === catVal);

    document.getElementById("dept-total-count").innerText = list.length;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">No hay trámites en el catálogo.</td></tr>`;
        return;
    }

    list.forEach(t => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 transition";
        tr.innerHTML = `
            <td class="p-3 font-bold text-slate-800">${t.title}</td>
            <td class="p-3"><span class="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold">${t.category}</span></td>
            <td class="p-3 text-slate-600 font-mono text-[11px]">${t.deadlineText}</td>
            <td class="p-3 text-slate-700 font-medium">
                ${
                    t.targetAudience === "Todos"
                        ? "Todos los alumnos"
                        : t.targetAudience === "Grupo"
                            ? `Grupo: ${t.targetGroupName}`
                            : `Matrícula: ${t.specificMatricula}`
                }
            </td>
            <td class="p-3 text-center space-x-1">
            <button
                onclick="openReportModal(${t.id})"
                class="text-blue-600 font-bold hover:underline px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                Reporte
            </button>

            <button
                onclick="editTramite(${t.id})"
                class="text-amber-600 font-bold hover:underline px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                Editar
            </button>

            <button
                onclick="deleteTramiteDept(${t.id})"
                class="text-rose-600 font-bold hover:underline px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                Eliminar
            </button>

        </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterDeptTable() {
    renderDeptTable();
}

async function deleteTramiteDept(id) {
    const confirmar = confirm("¿Estás seguro de eliminar este trámite?");
    if (!confirmar) return;
    try {
        const respuesta = await fetch(
            `${API_URL}/tramites/${id}`,
            {
                method: "DELETE"
            }
        );
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            showToast(datos.mensaje);
            return;
        }
        state.tramites = await cargarTramites();
        renderDeptTable();
        showToast(
            "Trámite eliminado correctamente",
            "fa-trash"
        );
    } catch (error) {
        console.error(error);
        showToast("Error al eliminar el trámite");
    }
}
function editTramite(id) {

    const tramite = state.tramites.find(t => t.id === id);

    if (!tramite) {
        showToast("No se encontró el trámite", "fa-triangle-exclamation");
        return;
    }


    state.editingTramiteId = id;


    document.getElementById("dept-title").value = tramite.title;

    document.getElementById("dept-date").value =
        tramite.deadline.split(" ")[0];

    document.getElementById("dept-time").value =
        tramite.deadline.split(" ")[1];

    document.getElementById("dept-category").value =
        tramite.category;


    document.getElementById("dept-instructions").value =
        tramite.description;


    document.getElementById("dept-location").value =
        tramite.location;


    // Destinatarios

    const radio = document.querySelector(
        `input[name="dept-destinatarios"][value="${tramite.targetAudience}"]`
    );

    if(radio){
        radio.checked = true;
    }


    toggleMatriculasInput();


    if(tramite.targetAudience === "Especifico"){

        document.getElementById("dept-specific-matriculas").value =
            Array.isArray(tramite.specificMatricula)
            ? tramite.specificMatricula.join(", ")
            : tramite.specificMatricula;

    }else{

        document.getElementById("dept-specific-matriculas").value = "";

    }


    document.getElementById("btn-save-tramite").innerText =
        "[ ACTUALIZAR TRÁMITE ]";


    document
        .getElementById("dept-title")
        .scrollIntoView({
            behavior:"smooth"
        });


    showToast("Editando trámite seleccionado", "fa-pen");

}

async function handleSurveySubmit(e) {
    e.preventDefault();
    try {
        const respuesta = await fetch(`${API_URL}/encuestas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                alumnoId: state.loggedStudent.id,
                priorizacion: Number(document.getElementById("survey-q1").value),
                facilidadCelular: document.getElementById("survey-q2").value,
                claridadInformacion: document.getElementById("survey-q3").value,
                comentarios: document.getElementById("survey-q4").value
            })
        });
        const data = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(data.mensaje);
        }
        showToast("¡Gracias por evaluar SIGA! Tu opinión ha sido registrada.", "fa-heart");
        switchStudentTab("dashboard");
    } catch (error) {
        console.error(error);
        showToast("No se pudo guardar la encuesta.", "fa-triangle-exclamation");
    }
}

async function openReportModal(id) {
    const tramite = state.tramites.find(t => t.id === id);
    if (!tramite) return;
    document.getElementById("report-title").innerText =
        `Reporte: ${tramite.title}`;
    const tbody = document.getElementById("report-body");
    tbody.innerHTML = "";
    try {
        const respuesta = await fetch(
            `${API_URL}/estatus/reporte/${id}`
        );
        const reporte = await respuesta.json();
        if (!respuesta.ok) {
            showToast("Error al obtener el reporte");
            return;
        }
        if (reporte.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3"
                        class="p-4 text-center text-slate-400 italic">
                        Ningún alumno ha realizado este trámite.
                    </td>
                </tr>
            `;
        } else {
            reporte.forEach(alumno => {
                const tr = document.createElement("tr");
                tr.className = "border-b border-slate-200";
                tr.innerHTML = `
                    <td class="p-3 font-mono">${alumno.matricula}</td>
                    <td class="p-3">${alumno.nombre}</td>
                    <td class="p-3 text-center">
                        <span class="text-emerald-600 font-bold">
                            ✅ ${alumno.estado}
                        </span>
                    </td>
                `;
                 tbody.appendChild(tr);
            });
        }
        document
            .getElementById("modal-report")
            .classList.remove("hidden");
    } catch (error) {
        console.error(error);
        showToast("Error al cargar el reporte");
    }
}

function closeReportModal() {
    document.getElementById("modal-report")
        .classList.add("hidden");
}

// INITIAL LOAD
window.onload = function() {
    cargarCategorias();
    cargarGrupos();

    if(state.loggedStudent){
        renderStudentDashboard();
        renderRealizadosTable();
    }

};