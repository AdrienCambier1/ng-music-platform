const express = require("express");
const app = express();
const port = 4000;
var cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
const SPOTIFY_API_URL = "https://api.spotify.com/v1/browse/new-releases";

// Activer CORS et configurer le client Angular
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Quelque chose s'est mal passé !");
});

// Initialiser l'API et écouter sur le port 4000
app.listen(port, () => {
  console.log(`Application à l'écoute sur le port ${port}`);
});

// Récupérer tous les produits depuis Spotify
app.get("/products", async (req, res) => {
  try {
    if (!accessToken) await getAccessToken();
    const albums = await fetchAlbums();
    res.json(albums);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des produits" });
  }
});

// Récupérer un produit spécifique par ID
app.get("/products/:id", async (req, res) => {
  const albumId = req.params.id;

  try {
    if (!accessToken) await getAccessToken();
    const albumDetails = await fetchAlbumDetails(albumId);
    res.json(albumDetails);
  } catch (error) {
    res.status(404).json({ error: "Produit non trouvé" });
  }
});

// Fonction pour obtenir un token d'accès à Spotify
async function getAccessToken() {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    null,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      params: { grant_type: "client_credentials" },
    }
  );
  accessToken = response.data.access_token;
}

// Fonction pour récupérer les albums
async function fetchAlbums() {
  try {
    const response = await axios.get(SPOTIFY_API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.albums.items.map((album) => {
      // Essayer d'obtenir les genres de l'album ou de l'artiste
      const albumGenres =
        album.genres && album.genres.length > 0
          ? album.genres
          : ["Genre inconnu"];

      // Récupérer l'ID de l'artiste et créer le lien vers son profil
      const artistLinks = album.artists.map((artist) => ({
        name: artist.name,
        profileUrl: artist.external_urls.spotify,
      }));

      return {
        id: album.id,
        title: album.name,
        author: album.artists.map((artist) => artist.name).join(", "),
        createdDate: album.release_date,
        style: albumGenres.join(", "),
        price: (Math.random() * 50).toFixed(2),
        quantity: 0,
        isFavorite: false,
        imageUrl: album.images[0]?.url || "",
        artists: artistLinks,
      };
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des albums Spotify",
      error.message
    );
    return [];
  }
}

// Fonction pour récupérer les détails d'un album spécifique
async function fetchAlbumDetails(albumId) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const album = response.data;
    return {
      id: album.id,
      title: album.name,
      author: album.artists.map((artist) => artist.name).join(", "),
      createdDate: album.release_date,
      price: (Math.random() * 50).toFixed(2),
      imageUrl: album.images[0]?.url || "",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de l'album",
      error.message
    );
    throw new Error("Produit non trouvé");
  }
}
