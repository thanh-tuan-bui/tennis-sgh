const POINT_NAMES = ["0", "15", "30", "40", "AD"]; 
const MAX_SETS = 3; 

// Score sera chargé par fetchScore()
let score = {
    sets: [[0, 0], [0, 0], [0, 0], [0, 0]], 
    points: [0, 0],
    currentSet: 1
};

// ===================================
// FONCTIONS API GOOGLE SHEETS
// ===================================

// Fonction pour lire le score depuis Google Sheets (doGet via GAS)
async function fetchScore() {
    try {
        const response = await fetch(GAS_API_URL);
        const data = await response.json();
        
        // Mettre à jour la variable globale et l'affichage
        score = data; 
        updateDisplay();
    } catch (error) {
        console.error("Erreur de lecture du score (Sheets API). Chargement du score par défaut.", error);
        // Utilise le score par défaut s'il y a une erreur de lecture
        updateDisplay();
        saveScore(); // Et on force la sauvegarde du défaut (si possible)
    }
}

// Fonction pour sauvegarder le score dans Google Sheets (doPost via GAS)
function saveScore() {
    fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain', 
        },
        body: JSON.stringify(score) 
    })
    .catch(error => console.error("Erreur de sauvegarde du score (Sheets API):", error));
    
    // NOTE: Pour une vraie synchro en temps réel, vous pouvez décommenter la ligne
    // 'setInterval(fetchScore, 3000);' à la fin du fichier.
}

// ===================================
// LOGIQUE DE JEU
// ===================================

function updateDisplay() {
    for (let s = 1; s <= MAX_SETS; s++) {
        document.getElementById(`set${s}-A`).textContent = score.sets[s][0];
        document.getElementById(`set${s}-B`).textContent = score.sets[s][1];
    }

    let pA = score.points[0];
    let pB = score.points[1];

    let displayA = POINT_NAMES[pA];
    let displayB = POINT_NAMES[pB];

    if (pA >= 3 && pB >= 3) {
        if (pA === pB) {
            displayA = displayB = "Deuce";
        } else if (pA > pB) {
            displayA = "Avantage";
            displayB = "40"; 
        } else {
            displayB = "Avantage";
            displayA = "40"; 
        }
    }

    document.getElementById('game-A').textContent = displayA;
    document.getElementById('game-B').textContent = displayB;

    checkMatchEnd();
}

function pointWon(player) {
    const pIndex = player - 1; 
    score.points[pIndex]++;

    let pA = score.points[0];
    let pB = score.points[1];

    if ((pA >= 4 || pB >= 4) && Math.abs(pA - pB) >= 2) {
        gameWon(player);
    }

    // Mise à jour locale immédiate (pour l'utilisateur qui clique)
    updateDisplay(); 
    // Sauvegarde en arrière-plan
    saveScore(); 
}

function gameWon(player) {
    const pIndex = player - 1;

    score.sets[score.currentSet][pIndex]++;
    score.points = [0, 0]; 

    let gA = score.sets[score.currentSet][0];
    let gB = score.sets[score.currentSet][1];

    if ((gA >= 6 || gB >= 6) && (Math.abs(gA - gB) >= 2 || (gA === 7 && gB === 6) || (gB === 7 && gA === 6))) {
        setWon(player);
    }
}

function setWon(player) {
    const pIndex = player - 1;

    score.sets[0][pIndex]++;

    if (score.sets[0][0] < (MAX_SETS + 1) / 2 && score.sets[0][1] < (MAX_SETS + 1) / 2) {
        score.currentSet++;
        if (!score.sets[score.currentSet]) {
            score.sets[score.currentSet] = [0, 0];
        }
    }
}

function checkMatchEnd() {
    let setsA = score.sets[0][0];
    let setsB = score.sets[0][1];
    let setsToWin = Math.ceil(MAX_SETS / 2);

    const playerA = document.getElementById('player1Name').textContent;
    const playerB = document.getElementById('player2Name').textContent;

    if (setsA >= setsToWin) {
        document.getElementById('matchStatus').textContent = `Fini ! ${playerA} gagne le match ${setsA}-${setsB} !`;
        disableButtons();
    } else if (setsB >= setsToWin) {
        document.getElementById('matchStatus').textContent = `Fini ! ${playerB} gagne le match ${setsA}-${setsB} !`;
        disableButtons();
    }
}

function disableButtons() {
    document.querySelectorAll('.buttons button').forEach(button => {
        button.disabled = true;
    });
}

// Appel initial : charger le score depuis Google Sheets au démarrage
document.addEventListener('DOMContentLoaded', fetchScore);

// Optionnel : Pour le temps réel (synchronisation des spectateurs)
// Décommentez la ligne suivante pour rafraîchir le score toutes les 3 secondes pour les spectateurs :
// setInterval(fetchScore, 3000);