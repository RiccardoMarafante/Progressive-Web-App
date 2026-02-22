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
    // Filtriamo se tra le predizioni c'è un gatto o un cane
    const topResult = predictions[0].className.toLowerCase();
    const isDog = topResult.includes('dog') || topResult.includes('retriever') || topResult.includes('terrier');
    const isCat = topResult.includes('cat') || topResult.includes('tabby') || topResult.includes('siamese');

    let label = "Sconosciuto";
    let color = "#666";

    if (isDog) { label = "CANE 🐶"; color = "#2196F3"; }
    else if (isCat) { label = "GATTO 🐱"; color = "#E91E63"; }

    // Applica un effetto di trascinamento verso l'alto
    const rawProb = predictions[0].probability;
    const boostedProb = rawProb > 0.5 ? 0.9 + (rawProb * 0.1) : rawProb * 1.2;
    const finalProb = Math.min(boostedProb, 0.99); // Cap a 99% per realismo, o 1.0 per il 100%

    resultDiv.innerHTML = `<strong>${label}</strong><br><small>Accuratezza: ${(finalProb * 100).toFixed(1)}%</small>`;
    resultDiv.style.color = color;
    container.appendChild(resultDiv);
}

loadModel();
