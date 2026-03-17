// --- CONFIGURACIÓN DE FESTIVOS FERROL 2026 ---
const festivos2026 = [
    "2026-01-01", "2026-01-06", "2026-01-07",
    "2026-02-17", // Martes de Carnaval
    "2026-03-19", // San José
    "2026-04-02", // Jueves Santo
    "2026-04-03", // Viernes Santo
    "2026-05-01", "2026-05-17", "2026-07-25",
    "2026-08-15", "2026-10-12", "2026-11-01",
    "2026-12-06", "2026-12-08", "2026-12-25"
];

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    configurarSemana();
    
    // Vincular eventos a todos los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => onTextChanged(e));
    });

    // Vincular cambio de idioma
    document.getElementById('pickerIdioma').addEventListener('change', actualizarTextos);
});

function configurarSemana() {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 es domingo
    const diff = (diaSemana === 0 ? -6 : 1 - diaSemana);
    const lunes = new Date(hoy.setDate(hoy.getDate() + diff));

    const ids = ['txtLunes', 'txtMartes', 'txtMiercoles', 'txtJueves'];
    
    ids.forEach((id, index) => {
        const fechaCorte = new Date(lunes);
        fechaCorte.setDate(lunes.getDate() + index);
        const fechaStr = fechaCorte.toISOString().split('T')[0];
        
        const el = document.getElementById(id);
        if (festivos2026.includes(fechaStr)) {
            el.value = "00:00";
            el.disabled = true;
        } else {
            el.value = "08:30";
            el.disabled = false;
        }
    });

    actualizarTextos();
}

function onTextChanged(e) {
    let val = e.target.value;
    
    // Auto-formateo de ":" para iPhone
    if (val.length === 2 && !val.includes(':')) {
        e.target.value = val + ':';
    }
    
    // Limitar a 5 caracteres
    if (val.length > 5) {
        e.target.value = val.substring(0, 5);
    }

    recalcularTodo();
}

function recalcularTodo() {
    const lang = document.getElementById('pickerIdioma').value;
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diff = (diaSemana === 0 ? -6 : 1 - diaSemana);
    const lunesBase = new Date(new Date().setDate(new Date().getDate() + diff));

    // Determinar día de salida (viernes o anterior si es festivo)
    let diaSalidaNum = 4; // Viernes
    for (let i = 4; i >= 0; i--) {
        const d = new Date(lunesBase);
        d.setDate(lunesBase.getDate() + i);
        if (!festivos2026.includes(d.toISOString().split('T')[0])) {
            diaSalidaNum = i;
            break;
        }
    }

    // Lógica de horas objetivo
    let objetivo = 41.0;
    for (let i = 0; i < 4; i++) {
        const d = new Date(lunesBase);
        d.setDate(lunesBase.getDate() + i);
        if (festivos2026.includes(d.toISOString().split('T')[0])) objetivo -= 8.5;
    }
    const viernes = new Date(lunesBase);
    viernes.setDate(lunesBase.getDate() + 4);
    if (festivos2026.includes(viernes.toISOString().split('T')[0])) objetivo -= 7.0;

    // Sumar acumulado
    let acumuladoMinutos = 0;
    const ids = ['txtLunes', 'txtMartes', 'txtMiercoles', 'txtJueves'];
    
    ids.forEach((id, index) => {
        if (index < diaSalidaNum) {
            acumuladoMinutos += parseTimeToMinutes(document.getElementById(id).value);
        }
    });

    const entradaFinalMin = parseTimeToMinutes(document.getElementById('txtEntradaFinal').value);
    const faltaMinutos = (objetivo * 60) - acumuladoMinutos;
    const resultadoMinutos = entradaFinalMin + faltaMinutos;

    // Mostrar resultado
    const horas = Math.floor(resultadoMinutos / 60);
    const mins = Math.floor(resultadoMinutos % 60);
    document.getElementById('lblResultado').innerText = 
        `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function parseTimeToMinutes(text) {
    if (!text || !text.includes(':')) return 0;
    const [h, m] = text.split(':').map(Number);
    return (h * 60) + (m || 0);
}

function actualizarTextos() {
    const lang = document.getElementById('pickerIdioma').value;
    const hoy = new Date();
    const diff = (hoy.getDay() === 0 ? -6 : 1 - hoy.getDay());
    const lunes = new Date(new Date().setDate(new Date().getDate() + diff));

    const etiquetas = {
        'Español': ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Semana del ', 'Entrada '],
        'Galego': ['Luns', 'Martes', 'Mércores', 'Xoves', 'Semana do ', 'Entrada '],
        'English': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Week of ', 'Entry ']
    };

    const t = etiquetas[lang];
    document.querySelector('label[for="txtLunes"]').innerText = t[0];
    document.querySelector('label[for="txtMartes"]').innerText = t[1];
    document.querySelector('label[for="txtMiercoles"]').innerText = t[2];
    document.querySelector('label[for="txtJueves"]').innerText = t[3];
    document.getElementById('lblSemana').innerText = t[4] + lunes.toLocaleDateString();
    
    recalcularTodo();
}