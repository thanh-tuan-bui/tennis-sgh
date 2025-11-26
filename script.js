const POINT_NAMES = ["0", "15", "30", "40", "AD"]; // Noms des points (0, 15, 30, 40, Avantage)
const MAX_SETS = 3; // Best-of-3 sets

let score = {
    sets: [
        [0, 0], // Sets gagnés [Joueur A, Joueur B]
        [0, 0], // Jeux Set 1 [Joueur A, Joueur B]
        [0, 0], // Jeux Set 2
        [0, 0]  // Jeux Set 3 (ou Set N)
    ],
    points: [0, 0], // Points du jeu actuel [Joueur A, Joueur B] (0, 1, 2, 3, 4 pour Ad)
    currentSet: 1
};

// Fonction pour mettre à jour l'affichage HTML
function updateDisplay() {
    // Mise à jour des Sets et Jeux
    for (let s = 1; s <= MAX_SETS; s++) {
        document.getElementById(`set${s}-A`).textContent = score.sets[s][0];
        document.getElementById(`set${s}-B`).textContent = score.sets[s][1];
    }

    // Mise à jour du Jeu actuel (utilisation de la table de POINT_NAMES)
    let pA = score.points[0];
    let pB = score.points[1];

    let displayA = POINT_NAMES[pA];
    let displayB = POINT_NAMES[pB];

    if (pA >= 3 && pB >= 3) {
        if (pA === pB) {
            displayA = displayB = "Deuce";
        } else if (pA > pB) {
            displayA = "Avantage";
            displayB = "40"; // Afficher 40 pour l'adversaire
        } else {
            displayB = "Avantage";
            displayA = "40"; // Afficher 40 pour l'adversaire
        }
    }

    document.getElementById('game-A').textContent = displayA;
    document.getElementById('game-B').textContent = displayB;

    checkMatchEnd();
}

// Fonction appelée lorsqu'un joueur gagne un point
function pointWon(player) {
    const pIndex = player - 1; // 0 pour Joueur A, 1 pour Joueur B
    score.points[pIndex]++;

    let pA = score.points[0];
    let pB = score.points[1];

    // Vérifie la victoire du Jeu
    if ((pA >= 4 || pB >= 4) && Math.abs(pA - pB) >= 2) {
        // Le jeu est gagné
        gameWon(player);
    }

    updateDisplay();
}

// Fonction appelée lorsqu'un joueur gagne un jeu
function gameWon(player) {
    const pIndex = player - 1;

    // Ajoute le jeu au set actuel
    score.sets[score.currentSet][pIndex]++;
    score.points = [0, 0]; // Réinitialise les points

    let gA = score.sets[score.currentSet][0];
    let gB = score.sets[score.currentSet][1];

    // Vérifie la victoire du Set
    if ((gA >= 6 || gB >= 6) && (Math.abs(gA - gB) >= 2 || (gA === 7 && gB === 6) || (gB === 7 && gA === 6))) {
        // Le set est gagné
        setWon(player);
    }
}

// Fonction appelée lorsqu'un joueur gagne un set
function setWon(player) {
    const pIndex = player - 1;

    // Ajoute le set au total général
    score.sets[0][pIndex]++;

    // Passe au set suivant si ce n'est pas le dernier
    if (score.sets[0][0] < (MAX_SETS + 1) / 2 && score.sets[0][1] < (MAX_SETS + 1) / 2) {
        score.currentSet++;
        // Initialise les jeux pour le nouveau set
        if (!score.sets[score.currentSet]) {
            score.sets[score.currentSet] = [0, 0];
        }
        document.getElementById(`set${score.currentSet}`).classList.add('current-game'); // Met en surbrillance le set actuel
    }
}

// Fonction pour vérifier si le match est terminé
function checkMatchEnd() {
    let setsA = score.sets[0][0];
    let setsB = score.sets[0][1];
    let setsToWin = Math.ceil(MAX_SETS / 2);

    if (setsA >= setsToWin) {
        document.getElementById('matchStatus').textContent = `Fini ! Joueur A gagne le match ${setsA}-${setsB} !`;
        disableButtons();
    } else if (setsB >= setsToWin) {
        document.getElementById('matchStatus').textContent = `Fini ! Joueur B gagne le match ${setsA}-${setsB} !`;
        disableButtons();
    }
}

function disableButtons() {
    document.querySelectorAll('.buttons button').forEach(button => {
        button.disabled = true;
    });
}

// Initialisation de l'affichage
document.addEventListener('DOMContentLoaded', updateDisplay);

// Note : Pour le fonctionnement en ligne, cette version suppose que les mises à jour sont faites
// manuellement via les boutons. Pour une *vraie* mise à jour en temps réel entre plusieurs utilisateurs,
// vous auriez besoin d'une base de données ou d'un service de "WebSockets" (comme Firebase ou un serveur Node.js).