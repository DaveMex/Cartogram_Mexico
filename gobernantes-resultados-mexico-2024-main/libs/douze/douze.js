import * as fflate from 'https://cdn.skypack.dev/fflate?min';

class Lienzo {
    constructor(id, aspect = 0.56) {

        if (typeof d3 === 'undefined') {
            throw new Error("D3js no existe, carga D3 antes de usar esta clase");
        };

        let selector = "#" + id;
        let body = d3.select("body");
        let seleccion = body.select(selector);

        if (seleccion.empty()) {
            this.svg = body.append("div").attr("id",id).append("svg");
        } else {
            this.svg = seleccion.append("svg");
        }

        this.aspect = aspect;
        this.container = d3.select(selector);

        let width = parseInt(this.container.style("width"));
        let height = width * this.aspect;

        this.margin = {top: 0, bottom: 0, right: 0, left: 0};
        this.effective_width = width - this.margin.left - this.margin.right;
        this.effective_height = height - this.margin.top - this.margin.bottom;

        this.gsvg = this.svg
            .attr("width", this.effective_width + this.margin.left + this.margin.right)
            .attr("height", this.effective_height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","g_svg")
            .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")")
            
    }

    set_aspect(aspect) {
        this.aspect = aspect;

        return this.recompute();
    }

    set_margin(margin) {

        if (margin.hasOwnProperty("top")) {
            this.margin.top = margin.top;
        };

        if (margin.hasOwnProperty("bottom")) {
            this.margin.bottom = margin.bottom;
        };

        if (margin.hasOwnProperty("right")) {
            this.margin.right = margin.right;
        };

        if (margin.hasOwnProperty("left")) {
            this.margin.left = margin.left;
        };

        return this.recompute();

    }

    recompute() {
        let width = parseInt(this.container.style("width"));
        let height = width * this.aspect;

        this.effective_width = width - this.margin.left - this.margin.right;
        this.effective_height = height - this.margin.top - this.margin.bottom;

        this.svg
            .attr("width", this.effective_width + this.margin.left + this.margin.right)
            .attr("height", this.effective_height + this.margin.top + this.margin.bottom);

        this.gsvg
            .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");
    
        return this;
        }
}

class Mapa {
    constructor(id, aspect = 0.56) {
        if (typeof d3 === 'undefined') {
            throw new Error("D3js no existe, carga D3 antes de usar esta clase");
        };

        if (typeof L === 'undefined') {
            throw new Error("Leaflet no existe, carga Leaflet antes de usar esta clase");
        };

        let selector = "#" + id;
        let body = d3.select("body");
        let seleccion = body.select(selector);

        if (seleccion.empty()) {
            body.append("div").attr("id",id);
        };

        this.aspect = aspect;
        this.container = d3.select(selector);

        let width = parseInt(this.container.style("width"));
        let height = width * this.aspect;

        this.container
            .style("width", width + "px")
            .style("height", height + "px");

        this.center = [24.433333, -102.133333];
        this.zoom = 5;

        this.mapa = L.map(id,{
            zoomSnap: 0.25,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 40
        }).setView(this.center, this.zoom);

        this.layer = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        L.tileLayer(this.layer, {
            //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.mapa);

        (function(){
            var originalInitTile = L.GridLayer.prototype._initTile;
            if (originalInitTile.isPatched) return;

            L.GridLayer.include({
                _initTile: function (tile) {
                    originalInitTile.call(this, tile);
        
                    var tileSize = this.getTileSize();
        
                    tile.style.width = tileSize.x + 1 + 'px';
                    tile.style.height = tileSize.y + 1 + 'px';
                }
            });

            L.GridLayer.prototype._initTile.isPatched = true;
        })()

    }

    set_aspect(aspect) {
        this.aspect = aspect;
        return this.recompute();
    }

    set_center(centro) {
        this.center = centro;
        this.mapa.setView(this.center, this.zoom);

        return this;
    }

    set_zoom(zoom) {
        this.zoom = zoom;
        this.mapa.setView(this.center, this.zoom);

        return this;
    }

    recompute() {

        let width = parseInt(this.container.style("width"));
        let height = width * this.aspect;

        this.container
            .style("width", width + "px")
            .style("height", height + "px");

        this.mapa.invalidateSize();

        return this;
    }

}

class Layer {
    constructor(mapa, geometries, clase) {

        let root_map = mapa.mapa;
        this.geometries = geometries;
        this.clase = clase;

        let svgm = d3.select(root_map.getPanes().overlayPane).append("svg").attr("class","svglayer");
        let gm = svgm.append("g").attr("class","leaflet-zoom-hide");

        let transform = d3.geoTransform({point: projectPoint});
        let path = d3.geoPath().projection(transform);

        function projectPoint(x, y) {
            var point = root_map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        let geopaths = gm.append("g").attr("class","mlayer")
            .selectAll(".geometria")
            .data(this.geometries.features)
            .enter().append("path")
            .attr("class", clase)
            .style("stroke","white")
            .style("stroke-width",1);

        mapa.mapa.on("viewreset", reset);
        mapa.mapa.on("zoom", reset);
        reset();

        this.svgm = svgm;
        this.gm = gm;
        this.path = path;
        this.geopaths = geopaths;

        function reset() {
            let bounds = path.bounds(geometries);
            let topLeft = bounds[0];
            let bottomRight = bounds[1];
    
            svgm.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");
    
            gm.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    
            geopaths.attr("d", path);
        }
    }

}

function geoJsonFromFeatures(features) {
    let geojson = {};
	geojson.features = features;
	geojson.type = "FeatureCollection";

    return geojson;
}

function geogzprocess(buffer) {

    if (typeof pako === 'undefined') {
        throw new Error("Pako no existe, carga Pako antes de usar esta función");
    };

    if (typeof topojson === 'undefined') {
        throw new Error("Topojson no existe, carga Topojson antes de usar esta función");
    };

    let topo_geometries = JSON.parse(pako.ungzip(new Uint8Array(buffer), {"to":"string"}));
    let keys = Object.keys(topo_geometries.objects);

    return keys.map((geometry_kind) => {
        return topojson.feature(topo_geometries,topo_geometries.objects[geometry_kind]);
    });
}

function geofflprocess(buffer) {

    if (typeof fflate === 'undefined') {
        throw new Error("FFlate no existe, carga Pako antes de usar esta función");
    };

    if (typeof topojson === 'undefined') {
        throw new Error("Topojson no existe, carga Topojson antes de usar esta función");
    };

    let textoU8 = fflate.decompressSync(new Uint8Array(buffer));
    let topo_geometries = JSON.parse(fflate.strFromU8(textoU8));

    let keys = Object.keys(topo_geometries.objects);

    return keys.map((geometry_kind) => {
        return topojson.feature(topo_geometries,topo_geometries.objects[geometry_kind]);
    });
}

function fflprocess(buffer) {

    if (typeof fflate === 'undefined') {
        throw new Error("FFlate no existe, carga Pako antes de usar esta función");
    };

    let textoU8 = fflate.decompressSync(new Uint8Array(buffer));
    let datos = JSON.parse(fflate.strFromU8(textoU8));

    return datos
}

const deflatePromise = (buffer) => {
    return new Promise ((resolve, reject) => {
        fflate.gunzip(new Uint8Array(buffer), (err, data) => {
            if (err) return reject(err);
            let topo_geometries = JSON.parse(fflate.strFromU8(data));
            let keys = Object.keys(topo_geometries.objects);
            let geoms =  keys.map((geometry_kind) => {
                return topojson.feature(topo_geometries,topo_geometries.objects[geometry_kind]);
            });
            resolve(geoms)
        })
    })
}

export {Lienzo};
export {Mapa};
export {geoJsonFromFeatures};
export {geogzprocess};
export {geofflprocess};
export {fflprocess};
export {Layer};
export {deflatePromise};
