// Supprimer l'action de la touche "entrée"
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

// Ouvre la fenêtre pop-up et lance la recherche de la carte Pokémon
popupOpen.addEventListener("click", () => {
  popup.style.display = "block";
  const nom = nomCarte.value;
  afficherCartePokemon(nom);
});

// Ferme la fenêtre pop-up lorsqu'on clique en dehors de celle-ci
window.addEventListener("click", (event) => {
  if (event.target === popup) {
    popup.style.display = "none";
  }
});

// Permet de charger les informations sur la popup lors de la recherche d'un pokémon
function afficherCartePokemon(nomCarte) {
  const apiUrl = `http://localhost:3000/cartes/${nomCarte}`;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur serveur");
      }
      return response.json();
    })
    .then((data) => {
      const nomPokemon = data.nom;
      const idPokemon = data.id;
      const typePokemon = data.type;
      const imageSrc = data.imageSrc;
      document.getElementById("pokeName").textContent = nomPokemon;
      document.getElementById("pokeId").textContent = idPokemon;
      document.getElementById("pokeType").textContent = typePokemon;
      document.getElementById("pokeImg").setAttribute("src", imageSrc);
    })
    .catch((error) => {
      console.error(error);
      alert("Carte introuvable");
    });
}

// Permet de rajouter au tableau des td conjointement aux tr déjà existants sur l'html
fetch("/cartes")
  .then((response) => response.json())
  .then((data) => {
    let tbody = document.getElementById("pokemonList");
    data.forEach((carte) => {
      let tr = document.createElement("tr");
      tr.setAttribute("data-id", carte.id);

      let tdNom = document.createElement("td");
      tdNom.textContent = carte.nom;

      let PokeId = document.createElement("td");
      PokeId.textContent = carte.id;

      let tdType = document.createElement("td");
      tdType.textContent = carte.type;

      let tdImage = document.createElement("td");
      let img = document.createElement("img");
      img.src = carte.imageSrc;
      tdImage.appendChild(img);

      let tdAction = document.createElement("td");

      let buttonModifier = document.createElement("button");
      buttonModifier.textContent = "Modifier";
      buttonModifier.classList.add("modify");
      buttonModifier.setAttribute("data-id", carte.id);

      let buttonSupprimer = document.createElement("button");
      buttonSupprimer.textContent = "Supprimer";
      buttonSupprimer.classList.add("delete");
      buttonSupprimer.setAttribute("data-id", carte.id);

      tdAction.appendChild(buttonModifier);
      tdAction.appendChild(document.createTextNode(" "));
      tdAction.appendChild(buttonSupprimer);

      tr.appendChild(tdNom);
      tr.appendChild(PokeId);
      tr.appendChild(tdType);
      tr.appendChild(tdImage);
      tr.appendChild(tdAction);

      tbody.appendChild(tr);


      // Permet d'observer l'url pour cacher les boutons d'ajout/modif/suppression
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const username = urlParams.get("username");
      const password = urlParams.get("password");

      const ajouterBtn = document.querySelector("#ajouter");
      const buttonsModifyDelete = document.querySelectorAll("td button");

      if (username === "admin" && password === "admin") {
        // L'URL est correcte, donc les boutons doivent être visibles
        ajouterBtn.style.display = "flex";
        buttonsModifyDelete.forEach((button) => {
          button.style.display = "inline";
        });
      } else {
        // L'URL est incorrecte, donc les boutons doivent être cachés
        ajouterBtn.style.display = "none";
        buttonsModifyDelete.forEach((button) => {
          button.remove();
        });
      }

      // Modifier l'apparence de l'URL sans modifier l'historique
      // const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      // window.history.replaceState({path: newUrl}, '', newUrl);

      // window.location.replace("http://localhost:3000/");

      //  http://localhost:3000/?username=admin&password=admin
      //  http://localhost:3000/



      // Permet de lancer les fonctions de modification
      const modifyBtns = document.querySelectorAll(".modify");
      modifyBtns.forEach((btn) => {
        btn.addEventListener("click", showModifyModal);
      });

      const formB = document.querySelector("#modify-form");
      formB.addEventListener("submit", modifyPokemon);

      // Permet de rajouter un appel à la fonction supprimerCarte depuis les boutons .delete
      const supprimer = document.getElementsByClassName("delete");
      Array.from(supprimer).forEach((btn) => {
        btn.addEventListener("click", supprimerCarte);
        btn.setAttribute("data-id", carte.id);
      });
    });
  })
  .catch((error) => console.error(error));

// Ajout de la carte pokémon sur la database de l'API
const form = document.forms.addPoke;
const ajouter = document.querySelector("#ajouter");
ajouter.addEventListener("click", (event) => {
  event.preventDefault();
  const nom = form.nom.value;
  const type = form.type.value;
  const imageSrc = form.imageSrc.value;
  const carte = { nom, type, imageSrc };
  fetch("/cartes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carte),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Carte ajoutée avec succès");
        form.reset();
        location.reload();
      } else {
        console.error("Erreur lors de l'ajout de la carte");
      }
    })
    .catch((error) => console.error(error));
});

// Fonction permettant de supprimer le pokémon de la database
function supprimerCarte(event) {
  const nomCarte = event.target
    .closest("tr")
    .querySelector("td:first-child").textContent;

  fetch(`/cartes/${nomCarte}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la carte");
      }
      alert("Carte supprimée avec succès");
      window.location.reload();
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
}

// Ouvre la fenêtre modale de modification et récupère les informations du pokémon
function showModifyModal(event) {
  const id = event.target.getAttribute("data-id");
  idPokemon = id;
  const apiUrl = `http://localhost:3000/cartes/id/${id}`;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur serveur");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("modify-nom").value = data.nom;
      document.getElementById("modify-type").value = data.type;
      document.getElementById("modify-imageSrc").value = data.imageSrc;
      document.getElementById("modify-popup").style.display = "block";
    })
    .catch((error) => {
      console.error(error);
      alert("Carte introuvable");
    });
}

// Envoie les informations du pokémon modifié au serveur
function modifyPokemon(event) {
  event.preventDefault();
  const nom = encodeURIComponent(document.getElementById("modify-nom").value);
  const type = encodeURIComponent(document.getElementById("modify-type").value);
  const imageSrc = document.getElementById("modify-imageSrc").value;
  const carte = { nom, type, imageSrc };

  // Ajouter la ligne suivante pour afficher le contenu de la variable 'carte'
  console.log(carte);

  fetch(`http://localhost:3000/cartes/id/${idPokemon}/modifier`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carte),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur serveur");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Réponse serveur : ", data);
      console.log("Carte modifiée avec succès");
      document.getElementById("modify-popup").style.display = "none";
      location.reload();
    });
}

// Permet de lancer les fonctions de modification
const modifyBtns = document.querySelectorAll(".modify-btn");
modifyBtns.forEach((btn) => {
  btn.addEventListener("click", showModifyModal);
});

const modifyForm = document.getElementById("modify-form");
modifyForm.addEventListener("submit", modifyPokemon);

const modal = document.querySelector(".modal");

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Réactiver le défilement de la page
  }
});

// const loginForm = document.querySelector('#login-form');

// loginForm.addEventListener('submit', (event) => {
//   event.preventDefault(); // Empêche le comportement par défaut de l'événement submit

//   const username = document.querySelector('#username').value;
//   const password = document.querySelector('#password').value;

//   // Appelle la fonction authAdmin dans middleware.js
//   middleware.authAdmin(username, password)
//     .then(() => {
//       // Si l'authentification est réussie, redirige vers la page d'accueil ou une autre page de votre choix
//       window.location.href = 'http://localhost:3000/';
//     })
//     .catch((error) => {
//       // Si l'authentification échoue, affiche le message d'erreur retourné par la fonction
//       console.error(error.message);
//     });
// });
