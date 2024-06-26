# Cartograma electoral de México
Se propone la creación de un nuevo tipo de mapa temático, un cartograma hexagonal, para representar datos electorales en México. Este enfoque permitirá a los lectores comprender patrones y hallazgos en los datos electorales de manera más clara. Se ha diseñado un formato de mosaico hexagonal para visualizar información sobre los trescientos distritos electorales federales para la elección de diputados. Se ha creado un archivo en formato topojson para facilitar esta visualización en sistemas de información geográfica de código abierto.
## Construcción
La representación del mosaico hexagonal se basa en una rejilla de 31 filas por 36 columnas, con polígonos hexagonales dispuestos en forma de panal. Los distritos correspondientes a cada estado están numerados en negro, mientras que en rojo se muestra el número total de distritos del país, del 1 al 300 según lo establecido por el Instituto Electoral Nacional. Estos números facilitan la organización de la información de las bases de datos. Además, se etiquetaron los 32 estados. Esta construcción se realizó en un programa vectorial para permitir su adaptación a otros formatos.
### Configuración 2021
<img width="1111" alt="reticula-cartograma" src="https://github.com/DaveMex/Cartogram_Mexico/assets/7179941/e28064e7-f145-41a7-ab00-5c3af3ccfc63">

### Configuración 2024
Cada censo poblacional que se realiza cada 10 años nos indica cambios en la distribución de la población a nivel nacional. Por ello se realizan nuevas distritaciones que buscsn equilibrar su representación en los trescientos distritos electorales federales. En la última configuración aprobada en el Instituto Nacional Electoral que se utiliza en las elecciones de 2024 ha habido cambios en los que algunos estados pierden o ganan distritos. Esta se refleja en el nuevo diseño del cartograma hexagonal que se presenta a continuación. Con la ayuda de Irving Morales Agiss se realizan y ahora se añaden los archivos geojson que son útiles para usarse en D3js.
<img width="1111" alt="cartograma-2024" src="https://github.com/DaveMex/Cartogram_Mexico/assets/7179941/f93aa0db-250a-477d-826b-ee8d512fe085">

### Uso libre
Estos archivos y su código es de uso libre, se pide que de crédito al origen del mismo.
