let baseDatos = [];
let seleccionado = null;
let historial = JSON.parse(localStorage.getItem('nutriHistorial')) || [];

const inputBusqueda = document.getElementById('busquedaAlimento');
const listaSugerencias = document.getElementById('listaSugerencias');
const inputCantidad = document.getElementById('inputCantidad');
const resultsBody = document.getElementById('resultsBody');
const infoCard = document.getElementById('infoSeleccionado');

// Iniciar carga de datos
async function init() {
    try {
        const res = await fetch('data/baseAlimentos.csv');
        const data = await res.text();
        parsearCSV(data);
    } catch (err) {
        resultsBody.innerHTML = `<div class="empty-state" style="color:red">Error al cargar CSV. Use un servidor local (Live Server).</div>`;
    }
}

function parsearCSV(texto) {
    const lineas = texto.split(/\r?\n/);
    baseDatos = lineas.slice(1).map(linea => {
        const col = linea.split(';');
        if (col.length < 15 || !col[1]) return null;
        
        return {
            nombre: col[0],
            medida: col[1],
            pesoBase: parseFloat(col[2].replace(',', '.')) || 0,
            nutrientes: [
                { n: "HC", v: col[3] }, { n: "Prot", v: col[4] }, { n: "Grasa", v: col[5] },
                { n: "Na", v: col[6] }, { n: "K", v: col[7] }, { n: "P", v: col[8] },
                { n: "Ca", v: col[9] }, { n: "Fe", v: col[10] }, { n: "Colest", v: col[11] },
                { n: "Purinas", v: col[12] }, { n: "Fibra", v: col[13] }, { n: "Agua", v: col[14] },
                { n: "Calorías", v: col[15] }
            ]
        };
    }).filter(item => item !== null);
}

// Lógica del buscador
inputBusqueda.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    listaSugerencias.innerHTML = '';
    if (term.length < 2) { listaSugerencias.style.display = 'none'; return; }

    const sugerencias = baseDatos.filter(item => item.nombre.toLowerCase().includes(term)).slice(0, 10);

    if (sugerencias.length > 0) {
        sugerencias.forEach(item => {
            const div = document.createElement('div');
            div.className = 'sugerencia-item';
            div.innerHTML = `<strong>${item.nombre}</strong> <small>(${item.medida})</small>`;
            div.onclick = () => seleccionarAlimento(item);
            listaSugerencias.appendChild(div);
        });
        listaSugerencias.style.display = 'block';
    } else {
        listaSugerencias.style.display = 'none';
    }
});

function seleccionarAlimento(item) {
    seleccionado = item;
    inputBusqueda.value = item.nombre;
    listaSugerencias.style.display = 'none';
    infoCard.style.display = 'block';
    infoCard.innerHTML = `<strong>${item.nombre}</strong><br>Base: ${item.medida} (${item.pesoBase}g/ml)`;
    renderTable();
}

function renderTable() {
    if (!seleccionado) return;
    const qty = parseFloat(inputCantidad.value) || 0;
    resultsBody.innerHTML = '';

    seleccionado.nutrientes.forEach(nut => {
        let valBaseStr = nut.v.trim();
        let displayBase = "-";
        let displayCalc = "-";

        if (valBaseStr !== "-" && valBaseStr !== "" && valBaseStr !== "*") {
            const numBase = parseFloat(valBaseStr.replace(',', '.')) || 0;
            const numCalc = seleccionado.pesoBase > 0 ? (qty * numBase) / seleccionado.pesoBase : 0;
            displayBase = numBase.toFixed(1);
            displayCalc = numCalc.toFixed(2);
        }

        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `<div class="label-cell">${nut.n}</div><div class="value-cell">${displayBase}</div><div class="result-cell">${displayCalc}</div>`;
        resultsBody.appendChild(row);
    });
}

// GUARDAR EN TABLA
document.getElementById('btnGuardar').addEventListener('click', () => {
    if (!seleccionado) return alert("Selecciona un alimento primero");
    const qty = parseFloat(inputCantidad.value) || 0;

    const calcular = (idx) => {
        let v = seleccionado.nutrientes[idx].v.trim();
        if (v === "-" || v === "" || v === "*") return 0;
        let numBase = parseFloat(v.replace(',', '.')) || 0;
        return seleccionado.pesoBase > 0 ? (qty * numBase) / seleccionado.pesoBase : 0;
    };

    const nuevoItem = {
        id: Date.now(),
        nombre: seleccionado.nombre,
        cantidad: qty + (seleccionado.nombre.toLowerCase().includes("aceite") ? "ml" : "g"),
        hc: calcular(0), prot: calcular(1), grasa: calcular(2),
        na: calcular(3), k: calcular(4), p: calcular(5),
        ca: calcular(6), fe: calcular(7), colest: calcular(8),
        purinas: calcular(9), fibra: calcular(10), agua: calcular(11),
        kcal: calcular(12)
    };

    historial.push(nuevoItem);
    actualizarHistorial();
});

function actualizarHistorial() {
    localStorage.setItem('nutriHistorial', JSON.stringify(historial));
    const body = document.getElementById('historialBody');
    body.innerHTML = '';

    // Inicializamos todos los sumadores en 0
    let sums = { hc:0, prot:0, grasa:0, na:0, k:0, p:0, ca:0, fe:0, colest:0, purinas:0, fibra:0, agua:0, kcal:0 };

    historial.forEach(item => {
        // Sumamos cada valor al total acumulado
        for (let key in sums) { 
            sums[key] += parseFloat(item[key]) || 0; 
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td><td>${item.cantidad}</td>
            <td>${parseFloat(item.hc).toFixed(1)}</td>
            <td>${parseFloat(item.prot).toFixed(1)}</td>
            <td>${parseFloat(item.grasa).toFixed(1)}</td>
            <td>${parseFloat(item.fibra).toFixed(1)}</td>
            <td>${parseFloat(item.na).toFixed(1)}</td>
            <td>${parseFloat(item.k).toFixed(1)}</td>
            <td>${parseFloat(item.p).toFixed(1)}</td>
            <td>${parseFloat(item.ca).toFixed(1)}</td>
            <td>${parseFloat(item.fe).toFixed(1)}</td>
            <td>${parseFloat(item.colest).toFixed(1)}</td>
            <td>${parseFloat(item.purinas).toFixed(1)}</td>
            <td>${parseFloat(item.agua).toFixed(1)}</td>
            <td>${parseFloat(item.kcal).toFixed(1)}</td>
            <td><button class="btn-remove" onclick="eliminarItem(${item.id})">✕</button></td>
        `;
        body.appendChild(tr);
    });

    // ACTUALIZACIÓN MANUAL DE CADA TOTAL (Para asegurar que los IDs coincidan)
    document.getElementById('totHC').textContent = sums.hc.toFixed(1);
    document.getElementById('totProt').textContent = sums.prot.toFixed(1);
    document.getElementById('totGrasa').textContent = sums.grasa.toFixed(1);
    document.getElementById('totFibra').textContent = sums.fibra.toFixed(1);
    document.getElementById('totNa').textContent = sums.na.toFixed(1);
    document.getElementById('totK').textContent = sums.k.toFixed(1);
    document.getElementById('totP').textContent = sums.p.toFixed(1);
    document.getElementById('totCa').textContent = sums.ca.toFixed(1);
    document.getElementById('totFe').textContent = sums.fe.toFixed(1);
    document.getElementById('totColest').textContent = sums.colest.toFixed(1);
    document.getElementById('totPurinas').textContent = sums.purinas.toFixed(1);
    document.getElementById('totAgua').textContent = sums.agua.toFixed(1);
    document.getElementById('totKcal').textContent = sums.kcal.toFixed(1);

    // Cálculo de Kcals por macros para la fila de abajo
    const mKcals = (sums.hc * 4) + (sums.prot * 4) + (sums.grasa * 9);
    document.getElementById('totalKcals').textContent = mKcals.toFixed(2) + " kcal (basado en HC, Prot, Grasa)";
}

window.eliminarItem = (id) => {
    historial = historial.filter(i => i.id !== id);
    actualizarHistorial();
};

document.getElementById('btnBorrarTodo').addEventListener('click', () => {
    if (confirm("¿Borrar todo el historial?")) { historial = []; actualizarHistorial(); }
});

// EXPORTAR EXCEL CON TODOS LOS NUTRIENTES
// 5. EXPORTAR A EXCEL (CSV Format) con TOTALES
document.getElementById('btnExportar').addEventListener('click', () => {
    if (historial.length === 0) return alert("No hay datos para exportar");

    // Definir el orden de los nutrientes para asegurar consistencia
    const keys = ['hc', 'prot', 'grasa', 'fibra', 'na', 'k', 'p', 'ca', 'fe', 'colest', 'purinas', 'agua', 'kcal'];
    
    // Cabeceras (con BOM para tildes en Excel)
    let csvContent = "\uFEFF"; 
    csvContent += "Alimento;Cantidad;HC(g);Prot(g);Grasa(g);Fibra(g);Na(mg);K(mg);P(mg);Ca(mg);Fe(mg);Colest(mg);Purinas(mg);Agua(g);Calorías(kcal)\n";

    // Variables para los totales finales
    let totales = { hc:0, prot:0, grasa:0, fibra:0, na:0, k:0, p:0, ca:0, fe:0, colest:0, purinas:0, agua:0, kcal:0 };

    // 1. Añadir las filas de alimentos
    historial.forEach(item => {
        let fila = [
            item.nombre,
            item.cantidad
        ];

        // Añadir valores de nutrientes y sumar al total
        keys.forEach(key => {
            let valor = parseFloat(item[key]) || 0;
            fila.push(valor.toFixed(2).replace('.', ',')); // Excel en español prefiere coma decimal
            totales[key] += valor;
        });

        csvContent += fila.join(';') + "\n";
    });

    // 2. Añadir fila de TOTALES
    let filaTotales = [
        "TOTALES",
        "-"
    ];

    keys.forEach(key => {
        filaTotales.push(totales[key].toFixed(2).replace('.', ','));
    });

    csvContent += filaTotales.join(';') + "\n";

    // 3. Añadir fila de Kcals por Macros (opcional, como en tu imagen)
    const mKcals = (totales.hc * 4) + (totales.prot * 4) + (totales.grasa * 9);
    csvContent += `\n;Kcals Totales (Macros);${mKcals.toFixed(2).replace('.', ',')} kcal\n`;

    // 4. Crear link de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Planilla_Nutricional.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

inputCantidad.addEventListener('input', renderTable);
document.addEventListener('click', (e) => { if (!inputBusqueda.contains(e.target)) listaSugerencias.style.display = 'none'; });

init();
actualizarHistorial();
// --- LÓGICA DE IMPORTACIÓN ---

const btnImportar = document.getElementById('btnImportar');
const inputFiles = document.getElementById('inputFiles');

// Al hacer clic en el botón visual, disparamos el selector de archivos oculto
btnImportar.addEventListener('click', () => inputFiles.click());

inputFiles.addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        const contenido = e.target.result;
        procesarImportacion(contenido);
    };
    // Leemos como UTF-8 para soportar tildes
    lector.readAsText(archivo, "UTF-8");
});

function procesarImportacion(csvTexto) {
    try {
        // 1. Quitar el BOM y separar por líneas
        const lineas = csvTexto.replace(/^\uFEFF/, "").split(/\r?\n/);
        const nuevosItems = [];

        // 2. Recorrer líneas (empezamos en 1 para saltar el encabezado)
        for (let i = 1; i < lineas.length; i++) {
            const fila = lineas[i].split(';');
            
            // Validaciones: saltar si la fila está vacía o es la de TOTALES
            if (fila.length < 10) continue;
            if (fila[0].trim().toUpperCase() === "TOTALES" || fila[0].trim() === "") continue;

            // Función interna para convertir "10,50" (Excel) a 10.50 (JS)
            const limpiarNum = (val) => {
                if (!val) return 0;
                return parseFloat(val.replace(',', '.')) || 0;
            };

            // Creamos el objeto con la misma estructura que usa tu app
            const item = {
                id: Date.now() + i, // Generamos un ID nuevo
                nombre: fila[0],
                cantidad: fila[1],
                hc: limpiarNum(fila[2]),
                prot: limpiarNum(fila[3]),
                grasa: limpiarNum(fila[4]),
                fibra: limpiarNum(fila[5]),
                na: limpiarNum(fila[6]),
                k: limpiarNum(fila[7]),
                p: limpiarNum(fila[8]),
                ca: limpiarNum(fila[9]),
                fe: limpiarNum(fila[10]),
                colest: limpiarNum(fila[11]),
                purinas: limpiarNum(fila[12]),
                agua: limpiarNum(fila[13]),
                kcal: limpiarNum(fila[14])
            };
            nuevosItems.push(item);
        }

        if (nuevosItems.length > 0) {
            if (confirm(`Se han detectado ${nuevosItems.length} alimentos. ¿Deseas agregarlos a tu tabla actual?`)) {
                historial = [...historial, ...nuevosItems];
                actualizarHistorial(); // Esta función ya la tienes, recalcula todo
                alert("Importación completada con éxito.");
            }
        } else {
            alert("No se encontraron datos válidos en el archivo.");
        }
    } catch (error) {
        console.error(error);
        alert("Error: El archivo no tiene el formato correcto.");
    }
    // Limpiar el input para permitir cargar el mismo archivo después si se desea
    inputFiles.value = "";
}