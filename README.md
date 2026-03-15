# 🍎 Calculadora Nutricional

Esta es una aplicación web interactiva y responsiva diseñada para calcular automáticamente los valores nutricionales de diversos alimentos basándose en una cantidad específica (g/ml). Utiliza una base de datos local en formato CSV y presenta una interfaz amigable con una temática roja profesional.

![Vista Previa](https://img.shields.io/badge/UI-Responsive-red) ![JavaScript](https://img.shields.io/badge/JS-Vanilla-yellow) ![CSS](https://img.shields.io/badge/Theme-Red-crimson)

## Características

-   **Buscador Difuso (Autocompletado):** Encuentra alimentos rápidamente mientras escribes.
-   **Cálculo Dinámico:** Los valores se recalculan instantáneamente al cambiar la cantidad de gramos o mililitros.
-   **Diseño Responsive:** Optimizado para computadoras, tablets y teléfonos móviles.
-   **Manejo de Datos Inteligente:** 
    -   Mantiene el símbolo `-` si el dato no existe en la base de datos (evita ceros falsos).
    -   Soporta decimales con formato local.
-   **Interfaz Temática:** Diseño profesional en tonos rojos con una mascota amigable en el encabezado.

## 📁 Estructura del Proyecto

```text
/proyecto-nutricion
│
├── index.html          # Estructura principal
├── css/
│   └── style.css       # Estilos, temática roja y media queries
├── js/
│   └── script.js       # Lógica de búsqueda, parsing de CSV y cálculos
├── data/
│   └── baseAlimentos.csv # Base de datos de alimentos
└── assets/img/
    └── nutriologo.png     # Imagen de la mascota (Nutria)
```


## Funcionamiento Técnico

-   **Carga de Datos:** El script utiliza la API `fetch` para leer el archivo CSV.
-   **Parsing:** Convierte el texto plano del CSV en un Array de objetos JavaScript, transformando las comas decimales en puntos para realizar operaciones matemáticas.
-   **Cálculo:** Se aplica la regla de tres simple:
    $$\text{Resultado} = \frac{\text{Cantidad Usuario} \times \text{Valor Nutriente Base}}{\text{Peso Base Alimento}}$$
-   **Validación:** Antes de renderizar, el script verifica si el valor original es un guion o asterisco para no mostrar resultados erróneos.
-   **Interactividad:** El buscador difuso se implementa con un evento `input` que filtra los alimentos en tiempo real, mostrando solo los que coinciden con el texto ingresado.
-   **Exportación CSV:** Permite al usuario exportar la tabla de resultados con un formato específico, incluyendo una fila de totales y una fila adicional con las calorías calculadas a partir de los macronutrientes.
-   **Importación de Datos:** El usuario puede importar un archivo CSV con la misma estructura que la base de datos para actualizar o agregar nuevos alimentos, con validaciones para asegurar la integridad de los datos.   

## 🛠️ Tecnologías Utilizadas

-   **HTML5**
-   **CSS3** (Flexbox, Grid, Variables CSS)
-   **Vanilla JavaScript** (ES6+)
