// Main application logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize scanner
    Scanner.init();

    // DOM Elements
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const scanAnotherBtn = document.getElementById('scan-another-btn');
    const retryBtn = document.getElementById('retry-btn');
    const scannerSection = document.getElementById('scanner-section');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const errorSection = document.getElementById('error');

    // Product display elements
    const productName = document.getElementById('product-name');
    const productWeight = document.getElementById('product-weight');
    const productBrand = document.getElementById('product-brand');
    const productBarcode = document.getElementById('product-barcode');
    const productIngredients = document.getElementById('product-ingredients');
    const productImage = document.getElementById('product-image');
    const errorMessage = document.getElementById('error-message');

    // Show/hide sections
    function showSection(section) {
        scannerSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');

        section.classList.remove('hidden');
    }

    function showScanner() {
        scannerSection.classList.remove('hidden');
        loadingSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    }

    // Handle successful barcode scan
    async function onScanSuccess(barcode) {
        showSection(loadingSection);
        
        try {
            const product = await API.getProduct(barcode);
            
            if (product.found) {
                displayProduct(product);
                showSection(resultsSection);
            } else {
                showError(`Product not found for barcode: ${barcode}`);
            }
        } catch (error) {
            showError(error.message);
        }
    }

    // Display product information
    function displayProduct(product) {
        productName.textContent = product.name;
        productWeight.textContent = product.weight;
        productBrand.textContent = product.brand;
        productBarcode.textContent = product.barcode;
        productIngredients.textContent = product.ingredients;

        if (product.image) {
            productImage.src = product.image;
            productImage.classList.remove('hidden');
        } else {
            productImage.classList.add('hidden');
        }
    }

    // Show error
    function showError(message) {
        errorMessage.textContent = message;
        showSection(errorSection);
    }

    // Handle scanner error
    function onScanError(message) {
        showError(message);
    }

    // Event Listeners
    startBtn.addEventListener('click', async () => {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        await Scanner.start(onScanSuccess, onScanError);
    });

    stopBtn.addEventListener('click', async () => {
        await Scanner.stop();
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
    });

    scanAnotherBtn.addEventListener('click', () => {
        showScanner();
    });

    retryBtn.addEventListener('click', () => {
        showScanner();
    });
});