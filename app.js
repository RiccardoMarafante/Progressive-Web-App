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
    
    // 1. RESET: Le probabilità devono partire da ZERO ogni singola volta
    let dogProb = 0;
    let catProb = 0;

    // 2. LOGICA DI CLASSIFICAZIONE
    predictions.forEach(p => {
        const name = p.className.toLowerCase();
        const isDog = name.includes('dog') || name.includes('retriever') || name.includes('terrier') || name.includes('puppy') || name.includes('beagle');
        const isCat = name.includes('cat') || name.includes('tabby') || name.includes('siamese') || name.includes('kitten') || name.includes('persian');

        if (isDog) dogProb += p.probability;
        if (isCat) catProb += p.probability;
    });

    let label = "Incerto ❓";
    let finalAccuracy = 0;
    let color = "#666";

    // 3. CALCOLO E BOOST (con Math.min per non superare 100)
    if (dogProb > catProb && dogProb > 0.05) {
        label = "CANE 🐶";
        color = "#2196F3";
        // Boost moderato: Math.sqrt porta i valori bassi più in alto
        finalAccuracy = Math.min(Math.sqrt(dogProb) * 100, 100);
    } else if (catProb > dogProb && catProb > 0.05) {
        label = "GATTO 🐱";
        color = "#E91E63";
        finalAccuracy = Math.min(Math.sqrt(catProb) * 100, 100);
    } else {
        // Se non è né cane né gatto, prendi la probabilità del primo oggetto generico trovato
        finalAccuracy = Math.min(predictions[0].probability * 100, 100);
    }

    // 4. AGGIORNAMENTO UI
    resultDiv.className = "prediction-result";
    resultDiv.innerHTML = `
        <strong style="color: ${color}">${label}</strong><br>
        <small>Accuratezza: ${finalAccuracy.toFixed(1)}%</small>
    `;
    container.appendChild(resultDiv);
}

loadModel();
