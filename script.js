// --- Configuration des Questions issues de vos chapitres ---
const helpTexts = {
    1: "Aide Défi 1 : Observe le schéma. Les fichiers se trouvent à droite. Suis les lignes rouges pour voir dans quel dossier de l'arborescence ils doivent être rangés.",
    2: "Aide Défi 2 : Pense à la bande dessinée du cours ! Quand le professeur efface les lettres après le point, on ne sait plus rien du type de fichier. L'icône change aussi selon le format.",
    3: "Aide Défi 3 : Regarde le tableau de ton cours. .mp3 = Musique (Lecteur multimédia), .webm = Vidéo (VLC), .pdf = Texte/Document (Adobe Acrobat), .jpg/.png = Image.",
    4: "Aide Défi 4 : Fais l'addition : Vidéo (350 Mo) + Musique (8 Mo) = 358 Mo. Compare ce total aux 500 Mo de libre sur la clé USB.",
    5: "Aide Défi 5 : Recopie exactement le chemin en respectant les majuscules, les espaces et les antislashs (\\). Exemple : H:\\Ma classe\\Dossier en consultation\\..."
};

// --- Initialisation des variables d'état sécurisée (anti-blocage navigateur) ---
let score = 4000;
let errorsCount = 0;
let currentScreen = 'screen-intro';

try {
    if (localStorage.getItem('tice_score')) score = parseInt(localStorage.getItem('tice_score'));
    if (localStorage.getItem('tice_errors')) errorsCount = parseInt(localStorage.getItem('tice_errors'));
    if (localStorage.getItem('tice_screen')) currentScreen = localStorage.getItem('tice_screen');
} catch (e) {
    console.warn("Le stockage local est bloqué par le navigateur. Le jeu fonctionnera sans sauvegarde automatique.");
}

// --- Gestion en Temps Réel du Zoom (Accessibilité) ---
window.addEventListener('DOMContentLoaded', () => {
    const zoomRange = document.getElementById('zoom-range');
    const zoomLabel = document.getElementById('zoom-label');

    if (zoomRange && zoomLabel) {
        zoomRange.addEventListener('input', (e) => {
            const value = e.target.value;
            document.body.classList.remove('zoom-level-2', 'zoom-level-3');
            if (value === "1") zoomLabel.textContent = "Normal";
            else if (value === "2") { document.body.classList.add('zoom-level-2'); zoomLabel.textContent = "Grand"; }
            else if (value === "3") { document.body.classList.add('zoom-level-3'); zoomLabel.textContent = "Très Grand / DYS"; }
        });
    }

    // Appliquer l'état au démarrage
    document.getElementById('current-score').textContent = score;
    if (currentScreen !== 'screen-intro') {
        nextScreen(currentScreen, false);
    }
});

function saveProgress(screenId) {
    try {
        localStorage.setItem('tice_score', score);
        localStorage.setItem('tice_errors', errorsCount);
        localStorage.setItem('tice_screen', screenId);
    } catch (e) {
        // Ignore discrètement l'erreur si le stockage est désactivé
    }
}

function nextScreen(screenId, shouldSave = true) {
    document.querySelectorAll('main > section').forEach(screen => screen.classList.remove('active-screen'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active-screen');
        if (shouldSave) saveProgress(screenId);
    }
}

function triggerError() {
    errorsCount++;
    score = Math.max(0, score - 25);
    document.getElementById('current-score').textContent = score;
    try {
        localStorage.setItem('tice_score', score);
        localStorage.setItem('tice_errors', errorsCount);
    } catch (e) {}
}

function resetGameDirect() {
    if (confirm("Veux-tu vraiment remettre le score à 4000 et recommencer l'activité depuis le début ?")) {
        try {
            localStorage.clear();
        } catch (e) {}
        score = 4000;
        errorsCount = 0;
        location.reload();
    }
}

// --- LOGIQUE DU DÉFI 1 : Tri & Arborescence (Page 1) ---
function checkDefi1() {
    const r1 = document.getElementById('d1-r1').value;
    const r2 = document.getElementById('d1-r2').value;
    const r3 = document.getElementById('d1-r3').value;
    const feedback = document.getElementById('feedback-defi1');

    if (!r1 || !r2 || !r3) {
        feedback.textContent = "⚠️ Relie tous les fichiers avant de vérifier !";
        feedback.className = "feedback wrong";
        return;
    }

    if (r1 === "Musique" && r2 === "Cours" && r3 === "Images") {
        feedback.textContent = "✅ Bravo ! Les rangements sont parfaits.";
        feedback.className = "feedback correct";
        document.getElementById('defi1-validate-btn').classList.add('hidden');
        document.getElementById('next-to-defi2').classList.remove('hidden');
    } else {
        feedback.textContent = "❌ Mauvais rangements. Regarde bien les lignes de liaison sur ton document ! (-25 pts)";
        feedback.className = "feedback wrong";
        triggerError();
    }
}

// --- LOGIQUE DU DÉFI 2 : BD Reconnaître un Fichier (Page 1) ---
function checkDefi2() {
    const q1 = document.querySelector('input[name="bd-q1"]:checked');
    const q2_opts = document.querySelectorAll('input[name="bd-q2"]:checked');
    const feedback = document.getElementById('feedback-defi2');

    if (!q1 || q2_opts.length === 0) {
        feedback.textContent = "⚠️ Réponds aux deux questions avant de valider.";
        feedback.className = "feedback wrong";
        return;
    }

    let q2_vals = Array.from(q2_opts).map(cb => cb.value);
    const q1_ok = (q1.value === "lettres");
    const q2_ok = (q2_vals.includes("nom") && q2_vals.includes("icone") && q2_vals.includes("lettres") && q2_vals.length === 3);

    if (q1_ok && q2_ok) {
        feedback.textContent = "✅ Excellent ! L'analyse de la BD est parfaitement validée.";
        feedback.className = "feedback correct";
        document.getElementById('defi2-validate-btn').classList.add('hidden');
        document.getElementById('next-to-defi3').classList.remove('hidden');
    } else {
        feedback.textContent = "❌ Erreur dans l'analyse de la BD. Relis bien ton document ! (-25 pts)";
        feedback.className = "feedback wrong";
        triggerError();
    }
}

// --- LOGIQUE DU DÉFI 3 : Tableau Extensions & Logiciels (Page 2) ---
function validateDefi3() {
    const webm = document.getElementById('ext-webm').value;
    const mp3 = document.getElementById('ext-mp3').value;
    const pdf = document.getElementById('ext-pdf').value;
    const feedback = document.getElementById('feedback-defi3');

    if (!webm || !mp3 || !pdf) {
        feedback.textContent = "⚠️ Remplis tout le tableau avant de continuer.";
        feedback.className = "feedback wrong";
        return;
    }

    if (webm === "VLC" && mp3 === "Lecteur multimédia" && pdf === "Adobe Acrobat") {
        feedback.textContent = "✅ Parfait ! Logiciels et extensions bien associés.";
        feedback.className = "feedback correct";
        document.getElementById('defi3-validate-btn').classList.add('hidden');
        document.getElementById('next-to-defi4').classList.remove('hidden');
    } else {
        feedback.textContent = "❌ Erreur de logiciel. Vérifie ton tableau de cours ! (-25 pts)";
        feedback.className = "feedback wrong";
        triggerError();
    }
}

// --- LOGIQUE DU DÉFI 4 : Calcul de Tailles (Page 3) ---
function checkDefi4(isCorrect) {
    const feedback = document.getElementById('feedback-defi4');
    if (isCorrect) {
        feedback.textContent = "✅ Parfait ! La taille combinée (358 Mo) passe sous la limite de 500 Mo.";
        feedback.className = "feedback correct";
        document.getElementById('defi4-options').classList.add('hidden');
        document.getElementById('next-to-defi5').classList.remove('hidden');
    } else {
        feedback.textContent = "❌ Mauvaise réponse. Fais l'addition et réessaie ! (-25 pts)";
        feedback.className = "feedback wrong";
        triggerError();
    }
}

// --- LOGIQUE DU DÉFI 5 : Saisie Chemin Réseau Écrit (Page 2 du cours) ---
function checkDefi5() {
    const userInput = document.getElementById('network-path-input').value.trim();
    const feedback = document.getElementById('feedback-defi5');
    const correctPath = "H:\\Ma classe\\Dossier en consultation\\Technologie\\Images\\Pomme.bmp";

    if (!userInput) {
        feedback.textContent = "⚠️ Écris une réponse avant de vérifier.";
        feedback.className = "feedback wrong";
        return;
    }

    if (userInput === correctPath) {
        feedback.textContent = "✅ Incroyable ! Tu as saisi le chemin d'accès exact sans aucune erreur de syntaxe ni d'espace.";
        feedback.className = "feedback correct";
        document.getElementById('defi5-validate-btn').classList.add('hidden');
        document.getElementById('btn-finish').classList.remove('hidden');
    } else {
        feedback.textContent = "❌ Le chemin d'accès comporte une erreur. Vérifie bien les majuscules, les espaces et les barres '\\'. (-25 pts)";
        feedback.className = "feedback wrong";
        triggerError();
    }
}

// --- Gestion des Modales ---
function showHelp(defiId) {
    document.getElementById('help-text').textContent = helpTexts[defiId];
    document.getElementById('help-modal').classList.remove('hidden');
}
function closeHelp() { document.getElementById('help-modal').classList.add('hidden'); }

// --- Écran de Bilan final ---
function showBilan() {
    document.getElementById('final-score').textContent = score;
    document.getElementById('error-count').textContent = errorsCount;
    
    const percent = Math.round((score / 4000) * 100);
    document.getElementById('final-percent').textContent = percent + "%";
    document.getElementById('final-bar').style.width = percent + "%";

    if (score >= 3500) {
        document.querySelectorAll('.table-bilan td[id^="status"]').forEach(td => { td.textContent = "🥇 Très bonne maîtrise"; td.className = "status-valid"; });
    } else if (score >= 2500) {
        document.querySelectorAll('.table-bilan td[id^="status"]').forEach(td => { td.textContent = "🥈 Maîtrise satisfaisante"; td.className = "status-valid"; });
    } else {
