const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fetchPromise = import('node-fetch').then(module => module.default);

const app = express();
const port = 3001;

// Configuración de CORS
const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
];

const corsOptions = {
    origin: function (origin, callback) {
        const isNgrok = origin && (origin.endsWith('.ngrok-free.app') || origin.endsWith('.ngrok.io'));
        if (!origin || whitelist.indexOf(origin) !== -1 || isNgrok) {
            callback(null, true);
        } else {
            callback(new Error(`El origen ${origin} no está permitido por CORS.`));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const fusekiBaseUrl = 'http://localhost:3030/ontofrutis';
const fusekiQueryUrl = `${fusekiBaseUrl}/query`;
const fusekiUpdateUrl = `${fusekiBaseUrl}/update`;
const fusekiDataUrl = `${fusekiBaseUrl}/data`;


const prefixes = `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX data: <http://localhost:3030/ontofrutis/data#>
`;

function sparqlEscapeString(value) {
    if (value === null || typeof value === 'undefined') return "";
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function ejecutarConsultaSPARQL(consulta) {
    const fetch = await fetchPromise;
    const response = await fetch(fusekiQueryUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/sparql-query',
            'Accept': 'application/sparql-results+json'
        },
        body: consulta
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de Fuseki. Status:", response.status, "Body:", errorText);
        throw new Error(`Error del servidor SPARQL [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    if (!data || !data.results || !data.results.bindings) {
        if (typeof data.boolean === 'boolean') {
            return data;
        }
        console.error("Respuesta inesperada de Fuseki (faltan bindings):", data);
        throw new Error('Respuesta inesperada del servidor SPARQL, no se encontraron bindings.');
    }
    return data.results.bindings;
}

async function ejecutarUpdateSPARQL(consulta) {
    const fetch = await fetchPromise;
    const response = await fetch(fusekiUpdateUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/sparql-update',
        },
        body: consulta
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de Fuseki al actualizar. Status:", response.status, "Body:", errorText);
        throw new Error(`Error del servidor SPARQL al actualizar [${response.status}]: ${errorText}`);
    }
    return response.text(); // O response.json(), dependiendo de lo que Fuseki devuelva.
}

// Endpoint para insertar una nueva fruta usando parámetros de la URL
app.post('/api/frutas/insertar', async (req, res) => {
    const {
        clase,
        id,
        nombreComun,
        nombreCientifico,
        region,
        contenidoAgua,
        color,
        sabor,
        textura,
        vitaminas, // String con nombres de vitaminas separados por comas
        minerales    // String con nombres de minerales separados por comas
    } = req.body;

    // Validación básica de los datos de entrada
    if (!clase || !id || !nombreComun || !region || !color || !sabor) {
        return res.status(400).json({ error: 'Nombre común, región, color y sabor son campos obligatorios.' });
    }

    // Convertir las cadenas de vitaminas y minerales en arrays
    const vitaminasArray = vitaminas ? vitaminas.split(',').map(v => v.trim()) : [];
    const mineralesArray = minerales ? minerales.split(',').map(m => m.trim()) : [];

     // Validación de los datos de entrada
    if (!clase) {
        return res.status(400).json({ error: 'Clase es obligatoria' });
    }
    if (!id) {
        return res.status(400).json({ error: 'ID es obligatorio' });
    }
    if (!nombreComun) {
        return res.status(400).json({ error: 'Nombre común es obligatorio' });
    }
    if (!Array.isArray(vitaminasArray)) {
        return res.status(400).json({ error: 'Vitaminas debe ser un array' });
    }

    if (!Array.isArray(mineralesArray)) {
        return res.status(400).json({ error: 'Minerales debe ser un array' });
    }

    const frutaURI = `data:${sparqlEscapeString(nombreComun.replace(/\s+/g, '_'))}`;
    const tipoFruta = clase.toLowerCase();
    //const tipoFruta = clase.toLowerCase().includes("agri") ? 'data:climatericas' : 'data:noclimatericas';

    let insertTriples = [
        `${frutaURI} rdf:type data:${tipoFruta} .`,
        `${frutaURI} data:nombrecomunfruta "${sparqlEscapeString(nombreComun)}" .`,
        id ? `${frutaURI} data:id "${sparqlEscapeString(id)}" .` : '',
        nombreCientifico ? `${frutaURI} data:nombrecientificofruta "${sparqlEscapeString(nombreCientifico)}" .` : '',
        region ? `${frutaURI} data:deregion "${sparqlEscapeString(region)}" .` : '',
        contenidoAgua ? `${frutaURI} data:tieneagua "${sparqlEscapeString(contenidoAgua)}"^^xsd:float .` : '',
        color ? `${frutaURI} data:tienecolor "${sparqlEscapeString(color)}" .` : '',
        sabor ? `${frutaURI} data:tienesabor "${sparqlEscapeString(sabor)}" .` : '',
        textura ? `${frutaURI} data:tienetextura "${sparqlEscapeString(textura)}" .` : '',
    ];

    // Insertar relaciones con Vitaminas
    vitaminasArray.forEach(vitaminaNombre => {
        const vitaminaURI = `data:${sparqlEscapeString(vitaminaNombre.replace(/\s+/g, '_'))}`;
        insertTriples.push(`${frutaURI} data:tienevitamina ${vitaminaURI} .`);
    });

    // Insertar relaciones con Minerales
    mineralesArray.forEach(mineralNombre => {
        const mineralURI = `data:${sparqlEscapeString(mineralNombre.replace(/\s+/g, '_'))}`;
        insertTriples.push(`${frutaURI} data:tiene_mineral ${mineralURI} .`);
    });

    const insertQuery = `
        ${prefixes}
        INSERT DATA {
            GRAPH <http://localhost:3030/ontofrutis/data> {
                ${insertTriples.filter(triple => triple !== '').join('\n                ')}
            }
        }
    `;

    try {
        const result = await ejecutarUpdateSPARQL(insertQuery);
        console.log("Inserción exitosa:", result);
        res.status(201).json({ message: 'Fruta insertada exitosamente.', frutaURI: frutaURI });
    } catch (error) {
        console.error("Error al insertar fruta:", error);
        res.status(500).json({ error: 'Error al insertar la fruta en la ontología.', details: error.message });
    }
});

// Endpoint para obtener TODA la información de TODAS las frutas,
// con vitaminas y minerales agrupados.
app.get('/api/frutas', async (req, res) => {
    const consultaSPARQL = `
    ${prefixes}
    SELECT
      (?fruitName_val AS ?fruitName)
      (?scientificName_val AS ?scientificName)
      (SAMPLE(?regionLabel) AS ?region)
      (SAMPLE(?waterContent_val) AS ?waterContent)
      (SAMPLE(?color_val) AS ?color)
      (SAMPLE(?sabor_val) AS ?sabor)
      (SAMPLE(?texture_val) AS ?texture)
      (GROUP_CONCAT(DISTINCT ?vitaminName_val; separator="||") AS ?vitaminasConcatenadas)
      (GROUP_CONCAT(DISTINCT ?mineralName_val; separator="||") AS ?mineralesConcatenados)
    WHERE {
      # Seleccionar frutas que sean climatericas O No_climatericas
      { ?fruta rdf:type data:climatericas . }
      UNION
      { ?fruta rdf:type data:noclimatericas . }

      ?fruta data:nombrecomunfruta ?fruitName_val . # Asumimos que todas las frutas tienen un nombre común
      OPTIONAL { ?fruta data:nombrecientificofruta ?scientificName_val . }

      OPTIONAL { ?fruta data:deregion ?regionLabel . }
      OPTIONAL { ?fruta data:tieneagua ?waterContent_val . }
      OPTIONAL { ?fruta data:tienecolor ?color_val . }
      OPTIONAL { ?fruta data:tienesabor ?sabor_val . }
      OPTIONAL { ?fruta data:tienetextura ?texture_val . }

      OPTIONAL {
        ?fruta data:tienevitamina ?vitamin_uri .
        ?vitamin_uri data:nombrecomunvitamina ?vitaminName_val .
      }
      OPTIONAL {
        ?fruta data:tiene_mineral ?mineral_uri .
        ?mineral_uri data:nombrecomunmineral ?mineralName_val .
      }
    }
    GROUP BY ?fruta ?fruitName_val ?scientificName_val # Agrupamos por la URI de la fruta y sus nombres principales
    ORDER BY ?fruitName_val
  `;
    try {
        const resultados = await ejecutarConsultaSPARQL(consultaSPARQL);
        let numericIdCounter = 1;
        const frutasFormateadas = resultados.map(r => ({
            ID: numericIdCounter++,
            Fruta: r.fruitName.value,
            NombreCientifico: r.scientificName?.value || null,
            Region: r.region?.value || null,
            ContenidoAgua: r.waterContent?.value || null,
            Color: r.color?.value || null,
            Sabor: r.sabor?.value || null,
            Textura: r.texture?.value || null,
            Vitaminas: r.vitaminasConcatenadas?.value ? r.vitaminasConcatenadas.value.split('||').filter(v => v.trim() !== '') : [],
            Minerales: r.mineralesConcatenados?.value ? r.mineralesConcatenados.value.split('||').filter(m => m.trim() !== '') : []
        }));
        res.json(frutasFormateadas);
    } catch (error) {
        console.error("Error en GET /api/frutas (detallado):", error);
        res.status(500).json({ error: 'Error al obtener todas las frutas con detalles', details: error.message });
    }
});

// Endpoint para obtener frutas por clasificación (climatericas o No_climatericas)
// mostrando toda la información detallada.
app.get('/api/frutas/clasificacion/:classificationType', async (req, res) => {
    const classificationParam = req.params.classificationType.toLowerCase();
    let classificationClassSparql;

    // Mapear el parámetro de la URL a la clase SPARQL correspondiente
    // Usaremos los nombres con tilde como en tu QUERY_GET_FRUTAS_BY_CLASSIFICATION
    if (classificationParam === 'climatericas' || classificationParam === 'climaterica') {
        classificationClassSparql = 'climatericas';
    } else if (classificationParam === 'noclimatericas' || classificationParam === 'noclimaterica') {
        classificationClassSparql = 'noclimatericas';
    } else {
        return res.status(400).json({ error: 'Tipo de clasificación no válido. Use "climatericas" o "noclimatericas".' });
    }

    const consultaSPARQLf = `
    ${prefixes}
    SELECT
      (?fruitName_val AS ?fruitName)
      (?scientificName_val AS ?scientificName)
      (SAMPLE(?regionLabel) AS ?region)
      (SAMPLE(?waterContent_val) AS ?waterContent)
      (SAMPLE(?color_val) AS ?color)
      (SAMPLE(?sabor_val) AS ?sabor)
      (SAMPLE(?texture_val) AS ?texture)
      (GROUP_CONCAT(DISTINCT ?vitaminName_val; separator="||") AS ?vitaminasConcatenadas)
      (GROUP_CONCAT(DISTINCT ?mineralName_val; separator="||") AS ?mineralesConcatenados)
    WHERE {
      ?fruta rdf:type data:${classificationClassSparql} . # Filtro por clasificación
      ?fruta data:nombrecomunfruta ?fruitName_val .
      OPTIONAL { ?fruta data:nombrecientificofruta ?scientificName_val . }
      OPTIONAL { ?fruta data:deregion ?regionLabel . }
      OPTIONAL { ?fruta data:tieneagua ?waterContent_val . }
      OPTIONAL { ?fruta data:tienecolor ?color_val . }
      OPTIONAL { ?fruta data:tienesabor ?sabor_val . }
      OPTIONAL { ?fruta data:tienetextura ?texture_val . }
      OPTIONAL {
        ?fruta data:tienevitamina ?vitamin_uri .
        ?vitamin_uri data:nombrecomunvitamina ?vitaminName_val .
      }
      OPTIONAL {
        ?fruta data:tiene_mineral ?mineral_uri .
        ?mineral_uri data:nombrecomunmineral ?mineralName_val .
      }
    }
    GROUP BY ?fruta ?fruitName_val ?scientificName_val
    ORDER BY ?fruitName_val
  `;

    try {
        const resultados = await ejecutarConsultaSPARQL(consultaSPARQLf);
        let numericIdCounter = 1;
        // El formateo de resultados es idéntico al de /api/frutas
        const frutasFormateadas = resultados.map(r => {
            // *** AÑADE ESTA LÍNEA PARA DEPURACIÓN ***
            //console.log('Objeto de resultado SPARQL (r):', r);

            return {
                ID: numericIdCounter++,
                Fruta: r.fruitName?.value ?? null,
                NombreCientifico: r.scientificName?.value || null,
                Region: r.region?.value || null,
                ContenidoAgua: r.waterContent?.value || null,
                Color: r.color?.value || null,
                Sabor: r.sabor?.value || null,
                Textura: r.texture?.value || null,
                Vitaminas: r.vitaminasConcatenadas?.value ? r.vitaminasConcatenadas.value.split('||').filter(v => v.trim() !== '') : [],
                Minerales: r.mineralesConcatenados?.value ? r.mineralesConcatenados.value.split('||').filter(m => m.trim() !== '') : []
            };
        });
        res.json(frutasFormateadas);
    } catch (error) {
        console.error(`Error en GET /api/frutas/clasificacion/${classificationClassSparql}:`, error);
        res.status(500).json({ error: `Error al obtener frutas de clasificación ${classificationClassSparql}`, details: error.message });
    }
});

// Endpoint para obtener frutas por Buscar
// mostrando toda la información detallada.
app.get('/api/frutas/buscar', async (req, res) => {
    const { color, mineral, sabor, region, vitamina } = req.query; // <-- ¡Lee de los parámetros de consulta!

    let whereClauses = [];

    if (color) {
        whereClauses.push(`?fruta data:tienecolor "${sparqlEscapeString(color)}" .`);
    }
    if (mineral) {
        whereClauses.push(`
      ?fruta data:tiene_mineral ?mineral_uri .
      ?mineral_uri data:nombrecomunmineral "${sparqlEscapeString(mineral)}" .
    `);
    }
    if (sabor) {
        whereClauses.push(`?fruta data:tienesabor "${sparqlEscapeString(sabor)}" .`);
    }
    if (region) {
        whereClauses.push(`?fruta data:deregion "${sparqlEscapeString(region)}" .`);
    }
    if (vitamina) {
        whereClauses.push(`
      ?fruta data:tienevitamina ?vitamin_uri .
      ?vitamin_uri data:nombrecomunvitamina "${sparqlEscapeString(vitamina)}" .
    `);
    }

    if (whereClauses.length === 0) {
        // Si no se proporciona ningún filtro, puedes devolver todas las frutas
        // o un mensaje de error, según prefieras. Aquí devolveremos un error 400
        // para indicar que se espera un filtro.
        return res.status(400).json({ error: 'Debe proporcionar al menos un parámetro de búsqueda (color, mineral, sabor, region o vitamina) en la URL.' });
    }

    const consultaSPARQL = `
    ${prefixes}
    SELECT
      (?fruitName_val AS ?fruitName)
      (?scientificName_val AS ?scientificName)
      (SAMPLE(?regionLabel) AS ?region)
      (SAMPLE(?waterContent_val) AS ?waterContent)
      (SAMPLE(?color_val) AS ?color)
      (SAMPLE(?sabor_val) AS ?sabor)
      (SAMPLE(?texture_val) AS ?texture)
      (GROUP_CONCAT(DISTINCT ?vitaminName_val; separator="||") AS ?vitaminasConcatenadas)
      (GROUP_CONCAT(DISTINCT ?mineralName_val; separator="||") AS ?mineralesConcatenados)
    WHERE {
      { ?fruta rdf:type data:climatericas . }
      UNION
      { ?fruta rdf:type data:noclimatericas . }

      ?fruta data:nombrecomunfruta ?fruitName_val .
      OPTIONAL { ?fruta data:nombrecientificofruta ?scientificName_val . }
      OPTIONAL { ?fruta data:deregion ?regionLabel . }
      OPTIONAL { ?fruta data:tieneagua ?waterContent_val . }
      OPTIONAL { ?fruta data:tienecolor ?color_val . }
      OPTIONAL { ?fruta data:tienesabor ?sabor_val . }
      OPTIONAL { ?fruta data:tienetextura ?texture_val . }

      OPTIONAL {
        ?fruta data:tienevitamina ?vitamin_uri .
        ?vitamin_uri data:nombrecomunvitamina ?vitaminName_val .
      }
      OPTIONAL {
        ?fruta data:tiene_mineral ?mineral_uri .
        ?mineral_uri data:nombrecomunmineral ?mineralName_val .
      }

      ${whereClauses.join('\n      ')}
    }
    GROUP BY ?fruta ?fruitName_val ?scientificName_val
    ORDER BY ?fruitName_val
  `;

    try {
        const resultados = await ejecutarConsultaSPARQL(consultaSPARQL);
        let numericIdCounter = 1;
        const frutasFormateadas = resultados.map(r => ({
            ID: numericIdCounter++,
            Fruta: r.fruitName?.value ?? null,
            NombreCientifico: r.scientificName?.value || null,
            Region: r.region?.value || null,
            ContenidoAgua: r.waterContent?.value || null,
            Color: r.color?.value || null,
            Sabor: r.sabor?.value || null,
            Textura: r.texture?.value || null,
            Vitaminas: r.vitaminasConcatenadas?.value ? r.vitaminasConcatenadas.value.split('||').filter(v => v.trim() !== '') : [],
            Minerales: r.mineralesConcatenados?.value ? r.mineralesConcatenados.value.split('||').filter(m => m.trim() !== '') : []
        }));
        res.json(frutasFormateadas);
    } catch (error) {
        console.error("Error en GET /api/frutas/buscar-url:", error);
        res.status(500).json({ error: 'Error al buscar frutas con filtros desde URL', details: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
