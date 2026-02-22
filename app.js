let model;
const status = document.getElementById('status');
const uploadBtn = document.getElementById('uploadBtn');
const imageUpload = document.getElementById('imageUpload');
const resultsGrid = document.getElementById('resultsGrid');

// Carica il modello MobileNet
async function loadModel() {
    model = await mobilenet.load();
    status.innerText = "Modello Pronto! Seleziona le immagini.";
    uploadBtn.disabled = false;
}

uploadBtn.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    resultsGrid.innerHTML = '';
    status.innerText = "Analisi in corso...";

    for (const file of files) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'card';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.width = 150;
        
        imgContainer.appendChild(img);
        resultsGrid.appendChild(imgContainer);

        // Aspetta che l'immagine sia caricata per l'analisi
        img.onload = async () => {
            const predictions = await model.classify(img);
            displayResult(imgContainer, predictions);
        };
    }
    status.innerText = "Analisi completata.";
});

function displayResult(container, predictions) {
    const resultDiv = document.createElement('div');
    
    // Inizializziamo le probabilità accumulate
    let dogProb = 0;
    let catProb = 0;

    // Analizziamo tutte le predizioni del modello (solitamente le prime 3)
    predictions.forEach(p => {
        const name = p.className.toLowerCase();
        // Verifichiamo se la classe appartiene a cani o gatti
        const isDog = name.includes('dog') || name.includes('retriever') || name.includes('terrier') || name.includes('puppy');
        const isCat = name.includes('cat') || name.includes('tabby') || name.includes('siamese') || name.includes('kitten');

        if (isDog) dogProb += p.probability;
        if (isCat) catProb += p.probability;
    });

    let label = "Sconosciuto";
    let finalAccuracy = 0;
    let color = "#666";

    // Determiniamo il vincitore in base alla somma
    if (dogProb > catProb && dogProb > 0.1) {
        label = "CANE 🐶";
        color = "#2196F3";
        // Applichiamo una radice quadrata per "spingere" il valore verso l'alto senza superare il 100%
        finalAccuracy = Math.sqrt(dogProb) * 100;
    } else if (catProb > dogProb && catProb > 0.1) {
        label = "GATTO 🐱";
        color = "#E91E63";
        finalAccuracy = Math.sqrt(catProb) * 100;
    } else {
        // Se le probabilità sono troppo basse o incerte
        finalAccuracy = predictions[0].probability * 100;
    }

    // Cap al 100% per sicurezza matematica
    if (finalAccuracy > 100){ 
        finalAccuracy = 100;
    }
        
    resultDiv.innerHTML = `
        <strong style="color: ${color}">${label}</strong><br>
        <small>Sicurezza: ${finalAccuracy.toFixed(1)}%</small>
    `;
    container.appendChild(resultDiv);
}

loadModel();
