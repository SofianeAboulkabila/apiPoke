// Description: Ce fichier contient le code du serveur Node.js


// Import des modules


const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')






app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// class Object carte pokemon
class CartePokemon {
  static id = 0;

  constructor(nom, type, imageSrc) {
    this.id = ++CartePokemon.id;
    this.nom = nom;
    this.type = type;
    this.imageSrc = imageSrc;
  }
}

// Récupérer la page index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Récupérer toutes les cartes Pokemon dans le fichier pokemonList.json methode GET
app.get('/cartes', (req, res) => {
  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }
    const cartes = JSON.parse(data).cartesPokemon;
    res.send(cartes);
  });
});

// Récupérer une carte Pokemon spécifique en utilisant son nom dans le fichier pokemonList.json methode GET
// Récupérer le nom et l'image d'une carte Pokemon spécifique en utilisant son nom dans le fichier pokemonList.json methode GET
app.get('/cartes/:nom', (req, res) => {
  const nomCarte = req.params.nom;
  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }
    const cartes = JSON.parse(data).cartesPokemon;
    const carteTrouvee = cartes.find(carte => carte.nom === nomCarte);
    if (carteTrouvee) {
      res.send(carteTrouvee);
    } else {
      res.status(404).send('Carte introuvable');
    }
  });
});



// Ajouter une carte Pokemon dans le fichier pokemonList.json methode POST
app.post('/cartes', (req, res) => {
  const { nom, type, imageSrc } = req.body;
  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }
    const pokemonList = JSON.parse(data);
    const cartes = pokemonList.cartesPokemon;
    const newCard = new CartePokemon(nom, type, imageSrc);
    newCard.id = cartes.length > 0 ? cartes[cartes.length - 1].id + 1 : 1;
    cartes.push(newCard);
    pokemonList.cartesPokemon = cartes;
    fs.writeFile('pokemonList.json', JSON.stringify(pokemonList), 'utf8', err => {
      if (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
        return;
      }
      res.send('Carte ajoutée avec succès');
    });
  });
});


// Récupérer une carte Pokemon spécifique en utilisant son ID dans le fichier pokemonList.json methode GET
app.get('/cartes/id/:id', (req, res) => {
  const idCarte = req.params.id;

  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }

    const cartes = JSON.parse(data).cartesPokemon;
    const carteTrouvee = cartes.find(carte => carte.id === Number(idCarte));
    if (carteTrouvee) {
      res.send(carteTrouvee);
    } else {
      res.status(404).send('Carte introuvable');
    }
  });
});

// Route permettant de modifier une carte Pokemon spécifique en utilisant son ID dans le fichier pokemonList.json
app.put('/cartes/id/:id/modifier', (req, res) => {
  const idCarte = req.params.id;
  const nom = decodeURIComponent(req.body.nom);
  const type = decodeURIComponent(req.body.type);
  const imageSrc = req.body.imageSrc;

  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }

    const cartes = JSON.parse(data).cartesPokemon;
    const carteTrouvee = cartes.find(carte => carte.id === Number(idCarte));
    if (carteTrouvee) {
      carteTrouvee.nom = nom;
      carteTrouvee.type = type;
      carteTrouvee.imageSrc = imageSrc;

      const newData = JSON.stringify({ cartesPokemon: cartes }, null, 2);

      fs.writeFile('pokemonList.json', newData, 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erreur serveur');
          return;
        }
        res.send('Carte modifiée avec succès');
      });
    } else {
      res.status(404).send('Carte introuvable');
    }
  });
});



// Supprimer une carte Pokemon à partir de son nom dans le fichier pokemonList.json methode DELETE
app.delete('/cartes/:nom', (req, res) => {
  const nomCarte = req.params.nom;
  fs.readFile('pokemonList.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur serveur');
      return;
    }
    const pokemonList = JSON.parse(data);
    const cartes = pokemonList.cartesPokemon;
    const indexCarte = cartes.findIndex(carte => carte.nom === nomCarte);
    if (indexCarte !== -1) {
      cartes.splice(indexCarte, 1);
      pokemonList.cartesPokemon = cartes;
      fs.writeFile('pokemonList.json', JSON.stringify(pokemonList), 'utf8', err => {
        if (err) {
          console.error(err);
          res.status(500).send('Erreur serveur');
          return;
        }
        res.send('Carte supprimée avec succès');
      });
    } else {
      res.status(404).send('Carte introuvable');
    }
  });
});


app.listen(
  3000, () => {
    console.log('Serveur démarré sur le port 3000');
  });
