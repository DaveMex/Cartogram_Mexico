# Cartograma Electoral Hexagonal de México

Este repositorio contiene los archivos necesarios para crear cartogramas electorales de México basados en una retícula hexagonal. Este enfoque de mapa temático permite visualizar los 300 distritos electorales federales con un área uniforme, facilitando la comprensión de patrones y hallazgos en los datos electorales.

Este proyecto es el resultado de una investigación de posgrado en el **Doctorado en Diseño y Visualización de la Información** (CYAD, UAM Azcapotzalco), con apoyo del programa del CONACYT (ahora SECIHTI).

---

## 🚀 Demo en Vivo

**La forma más fácil de entender este proyecto es viendo el demo funcional.**

Este repositorio incluye un ejemplo completo que mapea los resultados de las elecciones de 2024.

➡️ **[Ver el demo aquí](https://davemex.github.io/Cartogram_Mexico/gobernantes-resultados-mexico-2024-main/index.html)** (o abre el archivo `gobernantes-resultados-mexico-2024-main/index.html` localmente).

<img width="1111" alt="cartograma-2024" src="https://github.com/DaveMex/Cartogram_Mexico/assets/7179941/f93aa0db-250a-477d-826b-ee8d512fe085">

## Tabla de Contenidos

* [Demo en Vivo](#-demo-en-vivo)
* [Guía de Uso Rápido](#-guía-de-uso-rápido)
    * [Estructura de Datos (Clave)](#estructura-de-datos-clave)
    * [Ejemplo Básico con D3.js](#ejemplo-básico-con-d3js)
    * [Uso en Software GIS (QGIS)](#uso-en-software-gis-qgis)
* [Descripción de Archivos](#-descripción-de-archivos)
* [Contexto y Construcción](#contexto-y-construcción)
    * [Configuración 2021](#configuración-2021)
    * [Configuración 2024](#configuración-2024)
* [Uso y Licencia](#-uso-y-licencia)
* [Agradecimientos](#agradecimientos)

## 🗺️ Guía de Uso Rápido

Para usar este cartograma, necesitas "unir" tus propios datos electorales (almacenados, por ejemplo, en un archivo `.csv`) con los archivos geográficos (`.geojson`) proporcionados en este repositorio.

### Estructura de Datos (Clave)

La "llave" o "clave" para unir tus datos es el identificador del distrito. Los archivos GeoJSON en la carpeta `/geojsons/` contienen las siguientes propiedades (`properties`) que puedes usar:

* `"distrito_i"`: ID numérico del distrito, **del 1 al 300** (establecido por el INE).
* `"id_estado"`: ID numérico del estado.
* `"nombre_est"`: Nombre oficial del estado.
* `"dist_elec"`: Número de distrito *dentro* de su estado (ej. 1, 2, 3...).

**Ejemplo de cómo deben lucir tus datos (ej. `mis_datos.csv`):**

| distrito_i | partido_ganador | votos_partido_A |
| :--- | :--- | :--- |
| 1 | "PAN" | 45020 |
| 2 | "MORENA" | 67100 |
| 3 | "PRI" | 39000 |
| ... | ... | ... |
| 300 | "PVEM" | 51234 |

### Ejemplo Básico con D3.js

Este es un ejemplo simplificado de cómo cargar el cartograma y tus datos en D3.js (v6+) para colorear los distritos.

~~~

```javascript
// Dimensiones del SVG
const width = 800;
const height = 600;
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

// Rutas a los archivos
const urlCartograma = "geojsons/mexico300-2024.geojson";
const urlDatos = "mis_datos.csv";

// Cargar ambos archivos en paralelo
Promise.all([
    d3.json(urlCartograma),
    d3.csv(urlDatos)
]).then(([geojson, datos]) => {

    // Crear un Map para unir datos fácilmente (distrito_i -> fila de datos)
    const datosMap = new Map();
    datos.forEach(d => {
        datosMap.set(+d.distrito_i, d);
    });

    // Configurar proyección y path (en cartogramas a veces es null)
    const proyeccion = d3.geoIdentity().fitSize([width, height], geojson);
    const pathGenerator = d3.geoPath().projection(proyeccion);

    // Dibujar los distritos
    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("stroke", "#fff")
        .attr("fill", d => {
            // ¡Aquí ocurre la magia!
            // 1. Obtenemos el ID del distrito del GeoJSON
            const distritoId = d.properties.distrito_i;
            // 2. Buscamos sus datos en el Map
            const datosDistrito = datosMap.get(distritoId);
            // 3. Devolvemos un color basado en los datos
            if (datosDistrito) {
                return (datosDistrito.partido_ganador === "MORENA") ? "#a50f15" : "#ccc";
            } else {
                return "#eee"; // Distrito sin datos
            }
        });
});
~~~

### Uso en Software GIS (QGIS)

También puedes usar estos archivos en software de escritorio como QGIS (gratuito y de código abierto).

1. **Cargar el Cartograma:** Arrastra el archivo `geojsons/mexico300-2024.geojson` a QGIS, o ve a `Capa > Añadir capa > Añadir capa vectorial...`.
    
2. **Cargar tus Datos:** Arrastra tu archivo `mis_datos.csv`, o ve a `Capa > Añadir capa > Añadir capa de texto delimitado...`.
    
3. **Unir las Capas:**
    
    - Haz doble clic en la capa `mexico300-2024`.
    - Ve a la pestaña `Uniones`.
    - Haz clic en el botón `+` (verde).
    - **Unir capa:** `mis_datos`
    - **Unir campo:** `distrito_i`
    - **Campo objetivo:** `distrito_i`
    - Acepta todo.
        
4. **Estilizar:** Ahora puedes hacer clic derecho en la capa `mexico300-2024` > `Propiedades` > `Simbología` y usar la opción `Categorizado` o `Graduado` para colorear el mapa usando los campos de tu CSV (que ahora están prefijados, ej. `mis_datos_partido_ganador`).
    

## 🗂️ Descripción de Archivos

- `README.md`: Este archivo.
- `LICENSE`: El archivo de licencia.
- `/geojsons/`: **(Recomendado para web/D3.js)**. Contiene los archivos GeoJSON para las visualizaciones.
    
    - `mexico300-2024.geojson`: La retícula principal de 300 distritos (Configuración 2024).
    - `mexico300bordes-2024.geojson`: Solo los bordes exteriores de los estados (útil para superponer).
    - `mexico300-2024_censo.geojson`: Retícula que incluye datos del censo 2020 por distrito.
    - `/2021/`: **(Legado)**. Archivos de la configuración distrital anterior (2021).
    - `tilesMexico300.topo.json`: Archivo TopoJSON para la retícula 2021.
    - `*.svg`: **(Recomendado para diseño gráfico)**. Archivos vectoriales fuente, editables en Adobe Illustrator, Inkscape, etc.
    - `/gobernantes-resultados-mexico-2024-main/`: **(Demo)**. Un proyecto web completo que usa los archivos GeoJSON para mostrar resultados electorales.

## 🏗️ Contexto y Construcción

La representación del mosaico hexagonal se basa en una rejilla de 31 filas por 36 columnas, con polígonos hexagonales dispuestos en forma de panal. Los distritos correspondientes a cada estado están numerados en negro, mientras que en rojo se muestra el número total de distritos del país (1-300).

### Configuración 2021

Esta fue la primera versión, basada en la distritación federal de 2018.

<img width="1111" alt="reticula-cartograma" src="https://github.com/DaveMex/Cartogram_Mexico/assets/7179941/e28064e7-f145-41a7-ab00-5c3af3ccfc63">

### Configuración 2024

Debido al censo poblacional, la distritación federal cambió, afectando el número de distritos en varios estados. Esta es la configuración vigente, aprobada por el INE y utilizada en las elecciones de 2024.

<img width="1111" alt="cartograma-2024" src="https://github.com/DaveMex/Cartogram_Mexico/assets/7179941/f93aa0db-250a-477d-826b-ee8d512fe085">

## ⚖️ Uso y Licencia

Estos archivos y su código son de uso libre. Se distribuyen bajo los términos de la licencia especificada en el archivo `LICENSE` de este repositorio.

Se solicita amablemente **dar crédito al origen del proyecto** al utilizarlo.

## Acknowledgements

- **Autor Principal:** [Tu Nombre/Usuario de GitHub]
- **Colaboración:** Irving Morales Agiss, Martín Szyszlican y Andrés Snitcofsky 
- **Institución:** Doctorado en Diseño y Visualización de la Información, CYAD UAM Azcapotzalco.
- **Apoyo:** CONACYT (ahora SECIHTI).