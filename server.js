const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
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

app.listen(port, () => {
  console.log(`Application à l'écoute sur le port ${port}`);
});

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

function generatePriceFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const price = Math.abs(hash % 90) + 10;
  return price.toFixed(2);
}

async function fetchAlbums() {
  try {
    const response = await axios.get(SPOTIFY_API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        limit: 50,
        offset: 50,
      },
    });

    return response.data.albums.items.map((album) => ({
      id: album.id,
      title: album.name,
      author: album.artists.map((artist) => artist.name).join(", "),
      createdDate: album.release_date,
      price: generatePriceFromId(album.id),
      style: "Album",
      imageUrl: album.images[0]?.url || "",
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des albums Spotify",
      error.message
    );
    return [];
  }
}

async function fetchAlbumDetails(albumId) {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const album = response.data;

    const tracks = album.tracks.items.map((track) => ({
      trackId: track.id,
      trackName: track.name,
      trackDuration: track.duration_ms,
      trackPreviewUrl: track.preview_url,
    }));

    return {
      id: album.id,
      title: album.name,
      author: album.artists.map((artist) => artist.name).join(", "),
      createdDate: album.release_date,
      style: "Album",
      price: generatePriceFromId(album.id),
      imageUrl: album.images[0]?.url || "",
      tracks: tracks,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails de l'album",
      error.message
    );
    throw new Error("Produit non trouvé");
  }
}
