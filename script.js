/**
 * STATE & DATABASE MANAGEMENT
 */
let state = {
    loggedStudent: null,
    currentUserType: null,
    students: [
        {
            matricula: "e23192004",
            nombre: "Karim Alejandro García D."
        },
        {
            matricula: "e23192005",
            nombre: "Alejandro Barajas"
        },
        {
            matricula: "e23192006",
            nombre: "Juan Pérez"
        },
        {
            matricula: "e23192007",
            nombre: "María López"
        }
    ],
    activeDeptName: "Control escolar",
    tramites: [
        {
            id: 1,
            title: "Pago de Reinscripción",
            category: "Financiero",
            deadline: "2026-08-15 23:59",
            deadlineText: "15 Ago 2026 - 11:59 p.m.",
            urgency: "urgent",
            statusText: "Vencido hace 2 días",
            location: "Ventanilla de Control Escolar, Edificio A",
            hours: "Lunes a Viernes 08:00 a.m. - 3:00 p.m.",
            responsible: "Departamento de Control Escolar",
            completed: false,
            completedAt: null,
            targetAudience: "Todos",
            specificMatricula: "",
            description: "Realizar el pago correspondiente al cuatrimestre mayo-agosto para asegurar tu lugar y carga horaria en el sistema académico.",
            requirements: ["Comprobante de pago", "Formato firmado", "Identificación oficial"]
        },
        {
            id: 2,
            title: "Pago de Mensualidad",
            category: "Financiero",
            deadline: "2026-08-10 23:59",
            deadlineText: "10 Ago 2026 - 11:59 p.m.",
            urgency: "urgent",
            statusText: "Vencido hace 2 días",
            location: "Caja Principal Edificio B",
            hours: "08:00 a.m. - 4:00 p.m.",
            responsible: "Departamento de Finanzas",
            completed: false,
            completedAt: null,
            targetAudience: "Todos",
            specificMatricula: "",
            description: "Pago regular de la colegiatura mensual del periodo lectivo.",
            requirements: ["Ficha de depósito / Transferencia", "Matrícula visible"]
        }
    ],
    completedByStudent: {
    },
    editingTramiteId: null
};


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
function handleStudentLogin(e) {
    e.preventDefault();
    const matriculaInput = document.getElementById("input-matricula").value.trim();

    if(!matriculaInput) return;
    
    //Buscar al alumno
    const alumno = state.students.find(student =>
        student.matricula === matriculaInput
    );
    console.log(alumno);

    if (!alumno) {
        showToast("La matrícula no existe", "fa-triangle-exclamation");
        return;
    }

    state.currentUserType = 'student';
    state.loggedStudent = alumno;

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

function handleDeptLogin(e) {
    e.preventDefault();
    const deptName = document.getElementById("select-dept").value;
    const pass = document.getElementById("input-dept-password").value;

    if (pass !== "12345") {
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

// STUDENT DASHBOARD RENDERER
function renderStudentDashboard() {
    const containerUrgent = document.getElementById("container-urgent");
    const containerUpcoming = document.getElementById("container-upcoming");
    const containerOntime = document.getElementById("container-ontime");

    containerUrgent.innerHTML = "";
    containerUpcoming.innerHTML = "";
    containerOntime.innerHTML = "";

    const realizados = state.completedByStudent[state.loggedStudent.matricula] || [];
    console.log("Alumno:", state.loggedStudent);

    console.log("Realizados:", state.completedByStudent);

    console.log("Trámites:", state.tramites);
    const studentTramites = state.tramites.filter(t => {
        // Si ya lo realizó este alumno, no mostrarlo
        const yaRealizado = realizados.some(r => r.tramiteId === t.id);
        if (yaRealizado) return false;
        // Si el trámite es específico
        if (t.targetAudience === "Especifico") {
            return t.specificMatricula.includes(state.loggedStudent.matricula);
        }
        // Si es para todos
        return true;
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
    document.getElementById("modal-hours").innerText = t.hours;
    document.getElementById("modal-responsible").innerText = t.responsible;

    const reqList = document.getElementById("modal-requirements");
    reqList.innerHTML = "";
    (t.requirements || []).forEach(req => {
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

function quickCompleteStudent(id) {

    const matricula = state.loggedStudent.matricula;

    if (!state.completedByStudent[matricula]) {
        state.completedByStudent[matricula] = [];
    }

    // Evitar registrar el mismo trámite dos veces
    const yaExiste = state.completedByStudent[matricula].some(
        t => t.tramiteId === id
    );

    if (yaExiste) {
        showToast("Este trámite ya fue realizado.");
        return;
    }

    const now = new Date();

    state.completedByStudent[matricula].push({
        tramiteId: id,
        completedAt:
            `${now.getDate().toString().padStart(2,'0')}/` +
            `${(now.getMonth()+1).toString().padStart(2,'0')}/` +
            `${now.getFullYear()} ` +
            `${now.getHours().toString().padStart(2,'0')}:` +
            `${now.getMinutes().toString().padStart(2,'0')}`
    });

    renderStudentDashboard();

    showToast("Trámite marcado como realizado", "fa-check-circle");
}

// HISTÓRICO TRÁMITES REALIZADOS
function renderRealizadosTable() {
    const tbody = document.getElementById("tbody-realizados");
    tbody.innerHTML = "";

    const realizados = state.completedByStudent[state.loggedStudent.matricula] || [];
    let list = realizados.map(r => {
        const tramite = state.tramites.find(t => t.id === r.tramiteId);

        if (!tramite) return null;

        return {
            ...tramite,
            completedAt: r.completedAt
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

function reopenTramiteAction(id) {

    const matricula = state.loggedStudent.matricula;

    state.completedByStudent[matricula] =
        (state.completedByStudent[matricula] || []).filter(r => r.tramiteId !== id);

    renderRealizadosTable();
    renderStudentDashboard();

    showToast("Trámite reabierto");
}

// DEPARTAMENTO ACTIONS
function toggleMatriculasInput() {
    const isSpecific = document.querySelector('input[name="dept-destinatarios"]:checked').value === "Especifico";
    const wrapper = document.getElementById("wrapper-specific-matriculas");
    if (isSpecific) wrapper.classList.remove("hidden");
    else wrapper.classList.add("hidden");
}

function handleCreateTramite(e) {
    e.preventDefault();

    const title = document.getElementById("dept-title").value.trim();
    const date = document.getElementById("dept-date").value;
    const time = document.getElementById("dept-time").value;
    const cat = document.getElementById("dept-category").value;
    const audience = document.querySelector('input[name="dept-destinatarios"]:checked').value;
    const specificMat = document.getElementById("dept-specific-matriculas")
        .value
        .split(",")
        .map(m => m.trim())
        .filter(m => m !== "");
    const instructions = document.getElementById("dept-instructions").value.trim();
    const location = document.getElementById("dept-location").value.trim() || `Ventanilla ${state.activeDeptName}`;

    if (state.editingTramiteId !== null) {
        const tramite = state.tramites.find(
            t => t.id === state.editingTramiteId
        );
        if(tramite){
            tramite.title = title;
            tramite.category = cat;
            tramite.deadline = `${date} ${time}`;
            tramite.deadlineText = `${date} - ${time}`;
            tramite.location = location;
            tramite.targetAudience = audience;
            tramite.specificMatricula = specificMat;
            tramite.description = instructions;
            tramite.responsible = `Departamento de ${state.activeDeptName}`;
            tramite.statusText = `Vence el ${date}`;
        }
        showToast(
            "Trámite actualizado correctamente",
            "fa-pen"
        );
    } else {
        const newId = Date.now();
        state.tramites.unshift({
            id: newId,
            title: title,
            category: cat,
            deadline: `${date} ${time}`,
            deadlineText: `${date} - ${time}`,
            urgency: "ontime",
            statusText: `Vence el ${date}`,
            location: location,
            hours: "08:00 a.m. - 3:00 p.m.",
            responsible: `Departamento de ${state.activeDeptName}`,
            completed: false,
            completedAt: null,
            targetAudience: audience,
            specificMatricula: specificMat,
            description: instructions,
            requirements: [
                "Presentar identificación oficial",
                "Documentación en regla"
            ]

        });
        showToast(
            "Nuevo trámite registrado exitosamente",
            "fa-plus-circle"
        );

    }

    e.target.reset();
    toggleMatriculasInput();
    state.editingTramiteId = null;
    document.getElementById("btn-save-tramite").innerText =
        "[ GUARDAR TRÁMITE ]";
    renderDeptTable();
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
            <td class="p-3 text-slate-700 font-medium">${t.targetAudience === 'Especifico' ? `Matrícula: ${t.specificMatricula}` : 'Todos los alumnos'}</td>
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

function deleteTramiteDept(id) {
    state.tramites = state.tramites.filter(t => t.id !== id);
    renderDeptTable();
    showToast("Trámite eliminado del catálogo", "fa-trash");
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

function handleSurveySubmit(e) {
    e.preventDefault();
    showToast("¡Gracias por evaluar SIGA! Tu opinión ha sido registrada.", "fa-heart");
    switchStudentTab('dashboard');
}

function openReportModal(id) {

    const tramite = state.tramites.find(t => t.id === id);
    if (!tramite) return;

    document.getElementById("report-title").innerText =
        `Reporte: ${tramite.title}`;

    const tbody = document.getElementById("report-body");
    tbody.innerHTML = "";

    state.students.forEach(alumno => {

        const realizados =
            state.completedByStudent[alumno.matricula] || [];

        const realizado = realizados.some(r => r.tramiteId === id);

        const tr = document.createElement("tr");

        tr.className = "border-b border-slate-200";

        tr.innerHTML = `
            <td class="p-3 font-mono">${alumno.matricula}</td>

            <td class="p-3">${alumno.nombre}</td>

            <td class="p-3 text-center">
                ${
                    realizado
                    ? '<span class="text-emerald-600 font-bold">✅ Realizado</span>'
                    : '<span class="text-amber-600 font-bold">⏳ Pendiente</span>'
                }
            </td>
        `;

        tbody.appendChild(tr);

    });

    document.getElementById("modal-report")
        .classList.remove("hidden");
}

function closeReportModal() {
    document.getElementById("modal-report")
        .classList.add("hidden");
}

// INITIAL LOAD
window.onload = function() {
    if(state.loggedStudent){
        renderStudentDashboard();
        renderRealizadosTable();
    }

};