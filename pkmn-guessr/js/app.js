let currentPokemon = null;
let selectedGeneration = null;
let guessesRemaining = 5;
let totalGuesses = 5;
let cryAudio = null;

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});

function initEventListeners() {
    document.querySelectorAll('.gen-button').forEach(button => {
        button.addEventListener('click', () => {
            selectedGeneration = button.dataset.gen;
            startGame();
        });
    });
    
document.getElementById('submit-guess').addEventListener('click', submitGuess);
    
document.getElementById('guess-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitGuess();
    });
    
document.getElementById('play-cry').addEventListener('click', playCry);
    
document.getElementById('new-pokemon').addEventListener('click', startGame);
    
document.getElementById('change-generation').addEventListener('click', () => {
        showScreen('generation-selector');
    });
}

async function startGame() {
    guessesRemaining = totalGuesses;
    showScreen('game-screen');
    updateGuessIndicators(totalGuesses, guessesRemaining, false);
    clearGuessInput();
    
document.getElementById('pokemon-silhouette').src = '';
    
    try {
        currentPokemon = await getRandomPokemonFromGeneration(selectedGeneration);
        
        const spriteUrl = currentPokemon.sprites.other['official-artwork'].front_default 
            || currentPokemon.sprites.front_default;
        updateSilhouette(spriteUrl);
        
        if (currentPokemon.cries && currentPokemon.cries.latest) {
            cryAudio = new Audio(currentPokemon.cries.latest);
        } else {
            cryAudio = null;
        }
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to load Pokemon. Please try again.');
    }
}

function submitGuess() {
    const input = document.getElementById('guess-input');
    const guess = input.value.trim().toLowerCase();
    
    if (!guess) return;
    
    const correctName = currentPokemon.name.toLowerCase();
    
    if (guess === correctName) {
        const guessesUsed = totalGuesses - guessesRemaining + 1;
        updateGuessIndicators(totalGuesses, guessesRemaining - 1, true);
        fullyReveal();
        setTimeout(() => showResult(currentPokemon, true, guessesUsed), 500);
    } else {
        guessesRemaining--;
        updateGuessIndicators(totalGuesses, guessesRemaining, false);
        revealStep(totalGuesses - guessesRemaining);
        clearGuessInput();
        
        if (guessesRemaining === 0) {
            fullyReveal();
            setTimeout(() => showResult(currentPokemon, false, totalGuesses), 500);
        }
    }
}

function playCry() {
    if (cryAudio) {
        cryAudio.currentTime = 0;
        cryAudio.play().catch(err => console.log('Audio play failed:', err));
    }
}

function showScreen(screenId) {
    document.getElementById('generation-selector').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById(screenId).classList.remove('hidden');
}