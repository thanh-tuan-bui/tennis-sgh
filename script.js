const MAX_SETS = 3; 
// Les noms des points ne sont plus nécessaires, car le score vient directement en texte de Sheets.

// Variable pour stocker le score lu depuis Sheets
let score = {}; 

// ===================================
// FONCTIONS API GOOGLE SHEETS
// ===================================

// Fonction pour lire le score depuis Google Sheets (doGet via GAS)
async function fetchScore() {
    try {
        const response = await fetch(GAS_API_URL); 
        const data = await response.json();
        
        // Stocke les données lues (ex: data.setsGanésA, data.pointsA)
        score = data; 
        updateDisplay();
    } catch (error) {
        console.error("Erreur de lecture du score (Sheets API). Vérifiez la console GAS.", error);
        // Afficher un message d'erreur si la lecture échoue
        document.getElementById('matchStatus').textContent = "Erreur de connexion au score. Rechargez la page.";
    }
}

// ===================================
// LOGIQUE D'AFFICHAGE
// ===================================

function updateDisplay() {
    // Mise à jour des Sets gagnés (dans l'en-tête, Sets[0])
    // Note : Pour l'affichage des jeux, nous n'afficherons que le premier set pour la simplicité,
    // car le format simple A1:F1 ne contient pas les scores de Set 2 et Set 3.
    
    // Si votre tableau ne contient que 3 colonnes de set dans l'HTML, nous mettons les sets gagnés en Set 1.
    
    // SETS GAGNÉS (Position 1)
    document.getElementById(`set1-A`).textContent = score.setsGanésA || 0;
    document.getElementById(`set1-B`).textContent = score.setsGanésB || 0;
    
    // JEUX SET 1 (Position 2)
    document.getElementById(`set2-A`).textContent = score.jeuxSet1A || 0;
    document.getElementById(`set2-B`).textContent = score.jeuxSet1B || 0;
    
    // JEUX SET 2/3 : Mettre 0 ou laisser vide si non géré par la feuille simple
    document.getElementById(`set3-A`).textContent = 0;
    document.getElementById(`set3-B`).textContent = 0;


    // JEU ACTUEL (Position 4) : Les données viennent directement en texte/chiffre
    document.getElementById('game-A').textContent = score.pointsA || "0";
    document.getElementById('game-B').textContent = score.pointsB || "0";
    
    // Mettre à jour le statut pour afficher si le match est terminé (si vous l'entrez manuellement)
    if (score.pointsA === "Fini" || score.pointsB === "Fini") {
        document.getElementById('matchStatus').textContent = "Match terminé !";
    } else {
         document.getElementById('matchStatus').textContent = "";
    }
}


// Démarrage : on charge le score immédiatement
document.addEventListener('DOMContentLoaded', fetchScore);

// Temps réel : on rafraîchit le score toutes les 3 secondes
setInterval(fetchScore, 3000);