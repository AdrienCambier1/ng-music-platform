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

// Récupérer un produit spécifique par ID (avec les pistes)
app.get("/products/:id", async (req, res) => {
    const albumId = req.params.id;
  
    try {
      if (!accessToken) await getAccessToken();
      const albumDetails = await fetchAlbumDetails(albumId);
      
      // Ajouter les pistes à l'album
      const tracks = await fetchAlbumTracks(albumId);
      albumDetails.tracks = tracks; // On ajoute les pistes à l'album
  
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

// Convertir l'ID en prix aléatoire entre 10 et 100 euros
function generatePriceFromId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const price = Math.abs(hash % 90) + 10;
    return price.toFixed(2);
  }
  
// Fonction pour récupérer les albums avec les genres
async function fetchAlbums() {
    try {
        const response = await axios.get(SPOTIFY_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              limit: 50,
              offset: 50,
            },
          });
  
      // Pour chaque album, récupérer les genres des artistes
      const albumsWithGenres = await Promise.all(
        response.data.albums.items.map(async (album) => {
          // Récupérer les genres à partir des artistes de l'album
          const artistGenresPromises = album.artists.map(async (artist) => {
            const artistResponse = await axios.get(
              `https://api.spotify.com/v1/artists/${artist.id}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            return artistResponse.data.genres || ["Genre inconnu"];
          });
  
          const artistGenres = await Promise.all(artistGenresPromises);
          
          // Fusionner tous les genres des artistes (uniquement unique)
          const albumGenres = Array.from(new Set(artistGenres.flat()));
  
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
            price: generatePriceFromId(album.id),
            quantity: 0,
            isFavorite: false,
            imageUrl: album.images[0]?.url || "",
            artists: artistLinks,
          };
        })
      );
  
      return albumsWithGenres;
    } catch (error) {
      console.error("Erreur lors de la récupération des albums Spotify", error.message);
      return [];
    }
  }
  

// Fonction pour récupérer les genres de l'artiste
async function fetchArtistGenres(artistId) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.genres;
    } catch (error) {
      console.error("Erreur lors de la récupération des genres de l'artiste", error.message);
      return [];
    }
  }
  
  // Fonction pour récupérer les chansons de l'album
  async function fetchAlbumTracks(albumId) {
    try {
      const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.items.map((track) => ({
        trackId: track.id,
        trackName: track.name,
        trackDuration: track.duration_ms,
        trackPreviewUrl: track.preview_url,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des chansons de l'album", error.message);
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
      
      // Récupérer les genres de l'artiste(s)
      const genres = await fetchArtistGenres(album.artists[0].id);
      const albumGenres = genres.length > 0 ? genres.join(", ") : "Genre inconnu";
  
      // Récupérer la liste des morceaux de l'album
      const tracks = await fetchAlbumTracks(albumId);
  
      return {
        id: album.id,
        title: album.name,
        author: album.artists.map((artist) => artist.name).join(", "),
        createdDate: album.release_date,
        price: generatePriceFromId(album.id),
        imageUrl: album.images[0]?.url || "",
        genres: albumGenres,
        tracks: tracks,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'album", error.message);
      throw new Error("Produit non trouvé");
    }
  }
  