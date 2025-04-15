const express = require("express");
const redis = require("redis");
const app = express();
const port = 3000;

// Conectar a Redis usando el nombre del servicio de Docker Compose
const client = redis.createClient({
    url: "redis://redis-mandalorian:6379",
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis connection refused, retrying...');
            return Math.min(options.attempt * 100, 3000);
        }
        if (options.total_retry_time > 1000 * 60) {
            return new Error('Retry time exhausted');
        }
        return 1000;
    }
});

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
    try {
        await client.connect();
        console.log("Conectado a Redis (redis-mandalorian)");
    } catch (err) {
        console.error("Error al conectar a Redis:", err);
    }
})();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Lista de capítulos con rutas de imágenes ajustadas
const mandalorianEpisodes = [
    { id: 1, title: "Chapter 1: The Mandalorian", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap1.jpg" },
    { id: 2, title: "Chapter 2: The Child", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap2.jpg" },
    { id: 3, title: "Chapter 3: The Sin", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap3.jpg" },
    { id: 4, title: "Chapter 4: Sanctuary", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap4.jpg" },
    { id: 5, title: "Chapter 5: The Gunslinger", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap5.jpg" },
    { id: 6, title: "Chapter 6: The Prisoner", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap6.jpg" },
    { id: 7, title: "Chapter 7: The Reckoning", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap7.jpg" },
    { id: 8, title: "Chapter 8: Redemption", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap8.jpg" },
    { id: 9, title: "Chapter 9: The Marshal", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap9.jpg" },
    { id: 10, title: "Chapter 10: The Passenger", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap10.jpg" },
    { id: 11, title: "Chapter 11: The Heiress", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap11.jpg" },
    { id: 12, title: "Chapter 12: The Siege", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap12.jpg" },
    { id: 13, title: "Chapter 13: The Jedi", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap13.jpg" },
    { id: 14, title: "Chapter 14: The Tragedy", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap14.jpg" },
    { id: 15, title: "Chapter 15: The Believer", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap15.jpg" },
    { id: 16, title: "Chapter 16: The Rescue", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap16.jpg" },
    { id: 17, title: "Chapter 17: The Apostate", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap17.jpg" },
    { id: 18, title: "Chapter 18: The Mines of Mandalore", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap18.jpg" },
    { id: 19, title: "Chapter 19: The Convert", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap19.jpg" },
    { id: 20, title: "Chapter 20: The Foundling", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap20.jpg" },
    { id: 21, title: "Chapter 21: The Pirate", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap21.jpg" },
    { id: 22, title: "Chapter 22: Guns for Hire", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap22.jpg" },
    { id: 23, title: "Chapter 23: The Spies", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap23.jpg" },
    { id: 24, title: "Chapter 24: The Return", status: "disponible", reservedUntil: null, rentedUntil: null, image: "/images/cap24.jpg" },
];

// Inicializar capítulos en Redis usando hashes
async function initializeEpisodes() {
    try {
        // Limpiar toda la base de datos
        await client.flushAll();
        console.log("Base de datos Redis limpiada");

        // Cargar todos los episodios
        for (const episode of mandalorianEpisodes) {
            const episodeKey = `episode:${episode.id}`;
            await client.hSet(episodeKey, {
                id: episode.id.toString(),
                title: episode.title,
                status: episode.status,
                reservedUntil: episode.reservedUntil ? episode.reservedUntil.toString() : "",
                rentedUntil: episode.rentedUntil ? episode.rentedUntil.toString() : "",
                image: episode.image,
            });
            console.log(`Capítulo ${episode.id} - ${episode.title} cargado en redis-mandalorian como hash`);
        }
        console.log("Todos los capítulos de The Mandalorian cargados en redis-mandalorian");
    } catch (err) {
        console.error("Error al inicializar episodios en Redis:", err);
    }
}

// Función auxiliar para obtener todos los episodios desde Redis
async function getAllEpisodes() {
    const episodeKeys = await client.keys("episode:*");
    const episodes = [];
    for (const key of episodeKeys) {
        const episodeData = await client.hGetAll(key);
        episodes.push({
            id: parseInt(episodeData.id),
            title: episodeData.title,
            status: episodeData.status,
            reservedUntil: episodeData.reservedUntil ? parseInt(episodeData.reservedUntil) : null,
            rentedUntil: episodeData.rentedUntil ? parseInt(episodeData.rentedUntil) : null,
            image: episodeData.image,
        });
    }
    return episodes.sort((a, b) => a.id - b.id);
}

// Ruta para listar capítulos
app.get("/api/episodes", async (req, res) => {
    try {
        const currentTime = Date.now();
        let episodes = await getAllEpisodes();

        for (const episode of episodes) {
            if (episode.status === "reservado" && episode.reservedUntil && episode.reservedUntil < currentTime) {
                episode.status = "disponible";
                episode.reservedUntil = null;
                await client.hSet(`episode:${episode.id}`, {
                    status: episode.status,
                    reservedUntil: "",
                });
            }
            if (episode.status === "alquilado" && episode.rentedUntil && episode.rentedUntil < currentTime) {
                episode.status = "disponible";
                episode.rentedUntil = null;
                await client.hSet(`episode:${episode.id}`, {
                    status: episode.status,
                    rentedUntil: "",
                });
            }
        }

        res.json(episodes);
    } catch (err) {
        console.error("Error al listar episodios:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para obtener un episodio específico por ID
app.get("/api/episodes/:id", async (req, res) => {
    try {
        const episodeId = parseInt(req.params.id);
        const episodeKey = `episode:${episodeId}`;
        const episodeData = await client.hGetAll(episodeKey);

        if (!episodeData || Object.keys(episodeData).length === 0) {
            return res.status(404).json({ error: "Capítulo no encontrado" });
        }

        const episode = {
            id: parseInt(episodeData.id),
            title: episodeData.title,
            status: episodeData.status,
            reservedUntil: episodeData.reservedUntil ? parseInt(episodeData.reservedUntil) : null,
            rentedUntil: episodeData.rentedUntil ? parseInt(episodeData.rentedUntil) : null,
            image: episodeData.image,
        };

        res.json(episode);
    } catch (err) {
        console.error("Error al obtener episodio:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para reservar un capítulo
app.post("/api/reserve/:id", async (req, res) => {
    try {
        const episodeId = parseInt(req.params.id);
        const episodeKey = `episode:${episodeId}`;
        const episodeData = await client.hGetAll(episodeKey);

        if (!episodeData || Object.keys(episodeData).length === 0) {
            return res.status(404).json({ error: "Capítulo no encontrado" });
        }

        if (episodeData.status !== "disponible") {
            return res.status(400).json({ error: "Capítulo no disponible" });
        }

        const reservedUntil = Date.now() + 1 * 60 * 1000; // 1 minute
        await client.hSet(episodeKey, {
            status: "reservado",
            reservedUntil: reservedUntil.toString(),
        });

        res.json({ message: `Capítulo ${episodeId} reservado por 1 minuto` });
    } catch (err) {
        console.error("Error al reservar episodio:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para confirmar el pago
app.post("/api/confirm/:id", async (req, res) => {
    try {
        const episodeId = parseInt(req.params.id);
        const episodeKey = `episode:${episodeId}`;
        const episodeData = await client.hGetAll(episodeKey);

        if (!episodeData || Object.keys(episodeData).length === 0) {
            return res.status(404).json({ error: "Capítulo no encontrado" });
        }

        if (episodeData.status !== "reservado") {
            return res.status(400).json({ error: "El capítulo no está reservado" });
        }

        const price = 4.99; // Fixed price
        const rentedUntil = Date.now() + 1 * 60 * 1000; // 1 minute
        await client.hSet(episodeKey, {
            status: "alquilado",
            reservedUntil: "",
            rentedUntil: rentedUntil.toString(),
        });

        res.json({
            message: `Pago confirmado para el capítulo ${episodeId} por $${price}. Alquilado por 1 minuto.`,
        });
    } catch (err) {
        console.error("Error al confirmar pago:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Iniciar servidor y cargar episodios
app.listen(port, async () => {
    await initializeEpisodes();
    console.log(`Servidor corriendo en http://localhost:${port}`);
});