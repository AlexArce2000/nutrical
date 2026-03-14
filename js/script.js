let baseDatos = [];
let seleccionado = null;

const inputBusqueda = document.getElementById('busquedaAlimento');
const listaSugerencias = document.getElementById('listaSugerencias');
const inputCantidad = document.getElementById('inputCantidad');
const resultsBody = document.getElementById('resultsBody');
const infoCard = document.getElementById('infoSeleccionado');

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
                { n: "HC (g)", v: col[3] }, { n: "Prot. (g)", v: col[4] },
                { n: "Grasa (g)", v: col[5] }, { n: "Na (mg)", v: col[6] },
                { n: "K (mg)", v: col[7] }, { n: "P (mg)", v: col[8] },
                { n: "Ca (mg)", v: col[9] }, { n: "Fe (mg)", v: col[10] },
                { n: "Colest (mg)", v: col[11] }, { n: "Purinas (mg)", v: col[12] },
                { n: "Fibra (g)", v: col[13] }, { n: "Agua (g)", v: col[14] },
                { n: "Calorías", v: col[15] }
            ]
        };
    }).filter(item => item !== null);
}

inputBusqueda.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    listaSugerencias.innerHTML = '';
    if (term.length < 2) { listaSugerencias.style.display = 'none'; return; }

    const sugerencias = baseDatos.filter(item => 
        item.nombre.toLowerCase().includes(term)
    ).slice(0, 10);

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

        // Verificar si el dato existe y es numérico
        if (valBaseStr !== "-" && valBaseStr !== "" && valBaseStr !== "*") {
            const numBase = parseFloat(valBaseStr.replace(',', '.')) || 0;
            const numCalc = seleccionado.pesoBase > 0 ? (qty * numBase) / seleccionado.pesoBase : 0;
            
            displayBase = numBase.toFixed(1);
            displayCalc = numCalc.toLocaleString('es-ES', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
        }

        const row = document.createElement('div');
        row.className = 'grid-row';
        row.innerHTML = `
            <div class="label-cell">${nut.n}</div>
            <div class="value-cell">${displayBase}</div>
            <div class="result-cell">${displayCalc}</div>
        `;
        resultsBody.appendChild(row);
    });
}

inputCantidad.addEventListener('input', renderTable);
document.addEventListener('click', (e) => {
    if (!inputBusqueda.contains(e.target)) listaSugerencias.style.display = 'none';
});

init();