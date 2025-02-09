const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 4000;

// Variables d'authentification Spotify
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken = null;
let tokenExpiration = null; // Pour gérer l'expiration du token

const SPOTIFY_API_URL = "https://api.spotify.com/v1/browse/new-releases";

// Configuration de CORS pour Angular
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Erreur serveur !");
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

// Middleware pour s'assurer que le token Spotify est valide
async function ensureAccessToken() {
  if (!accessToken || Date.now() >= tokenExpiration) {
    await getAccessToken();
  }
}

// Obtenir un token d'accès Spotify (avec expiration)
async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + response.data.expires_in * 1000; // Conversion en ms
    console.log("🔑 Nouveau token Spotify obtenu !");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'obtention du token Spotify:",
      error.message
    );
    throw new Error("Impossible d'obtenir un token d'accès");
  }
}

// Utilitaire pour gérer l'erreur 429 (rate limit)
async function handleRateLimit(error, retryFunction, attempt = 1) {
  if (error.response && error.response.status === 429) {
    const retryAfter = error.response.headers["retry-after"] || 2; // Secondes d'attente
    const waitTime = Math.min(retryAfter * 1000, 60000); // Max 60 sec

    console.warn(`⚠️ Trop de requêtes. Attente de ${waitTime / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    return retryFunction(attempt + 1);
  }
  throw error;
}

// Récupérer les albums (avec retry en cas de 429)
async function fetchAlbums(attempt = 1) {
  try {
    await ensureAccessToken();
    const response = await axios.get(SPOTIFY_API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 20 },
    });

    return response.data.albums.items.map((album) => ({
      id: album.id,
      title: album.name,
      author: album.artists.map((artist) => artist.name).join(", "),
      createdDate: album.release_date,
      price: generatePriceFromId(album.id),
      imageUrl: album.images[0]?.url || "",
    }));
  } catch (error) {
    return handleRateLimit(error, fetchAlbums, attempt);
  }
}

// Récupérer les détails d'un album
async function fetchAlbumDetails(albumId, attempt = 1) {
  try {
    await ensureAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const album = response.data;
    const tracks = album.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      duration: track.duration_ms,
      previewUrl: track.preview_url,
    }));

    return {
      id: album.id,
      title: album.name,
      author: album.artists.map((artist) => artist.name).join(", "),
      createdDate: album.release_date,
      price: generatePriceFromId(album.id),
      imageUrl: album.images[0]?.url || "",
      tracks,
    };
  } catch (error) {
    return handleRateLimit(error, () => fetchAlbumDetails(albumId, attempt));
  }
}

// Générer un prix aléatoire à partir de l'ID de l'album
function generatePriceFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash % 90) + 10).toFixed(2);
}

// Routes API
app.get("/products", async (req, res) => {
  try {
    const albums = await fetchAlbums();
    res.json(albums);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des albums" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const albumDetails = await fetchAlbumDetails(req.params.id);
    res.json(albumDetails);
  } catch (error) {
    res.status(404).json({ error: "Album non trouvé" });
  }
});
