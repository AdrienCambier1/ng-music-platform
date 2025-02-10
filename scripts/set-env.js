const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const environmentFilePath = path.join(
  __dirname,
  "../src/environments/environment.ts"
);

fs.readFile(environmentFilePath, "utf8", (err, data) => {
  const updatedContent = data
    .replace(
      /SPOTIFY_CLIENT_ID: ''/,
      `SPOTIFY_CLIENT_ID: '${process.env.SPOTIFY_CLIENT_ID}'`
    )
    .replace(
      /SPOTIFY_CLIENT_SECRET: ''/,
      `SPOTIFY_CLIENT_SECRET: '${process.env.SPOTIFY_CLIENT_SECRET}'`
    );

  fs.writeFile(environmentFilePath, updatedContent, "utf8", (err) => {
    console.log("Fichier environment.ts mis à jour");
  });
});
