function showScreen(screenId) {
    document.getElementById('generation-selector').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById(screenId).classList.remove('hidden');
}

function updateSilhouette(imageUrl) {
    const img = document.getElementById('pokemon-silhouette');
    img.src = imageUrl;
    img.className = '';
}

function revealStep(step) {
    const img = document.getElementById('pokemon-silhouette');
    img.className = `reveal-${step}`;
}

function fullyReveal() {
    const img = document.getElementById('pokemon-silhouette');
    img.className = 'revealed';
}

function updateGuessIndicators(total, remaining, won) {
    const container = document.getElementById('guess-indicators');
    container.innerHTML = '';
    
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'guess-dot';
        if (i < total - remaining) {
            dot.classList.add(won && i === total - remaining - 1 ? 'correct' : 'used');
        }
        container.appendChild(dot);
    }
}

function clearGuessInput() {
    document.getElementById('guess-input').value = '';
}

function showResult(pokemon, won, guessesUsed) {
    showScreen('result-screen');
    
    const resultMessage = document.getElementById('result-message');
    resultMessage.textContent = won 
        ? `Correct! You got it in ${guessesUsed} guess${guessesUsed > 1 ? 'es' : ''}!`
        : `Game Over! It was ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}!`;
    resultMessage.className = won ? 'win' : 'lose';
    
    const artwork = document.getElementById('pokemon-artwork');
    artwork.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    
    renderPokemonStats(pokemon);
}

function renderPokemonStats(pokemon) {
    const container = document.getElementById('pokemon-stats');
    
    const types = pokemon.types.map(t => 
        `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`
    ).join('');
    
    const abilities = pokemon.abilities.map(a => 
        a.ability.name.replace('-', ' ')
    ).join(', ');
    
    const statsHtml = pokemon.stats.map(stat => {
        const statName = stat.stat.name
            .replace('special-attack', 'Sp. Atk')
            .replace('special-defense', 'Sp. Def')
            .replace('hp', 'HP')
            .replace('attack', 'Attack')
            .replace('defense', 'Defense')
            .replace('speed', 'Speed');
        
        const statClass = stat.stat.name
            .replace('special-attack', 'sp-attack')
            .replace('special-defense', 'sp-defense');
        
        const percentage = Math.min((stat.base_stat / 255) * 100, 100);
        
        return `
            <div class="stat-row">
                <span class="stat-name">${statName}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar ${statClass}" style="width: ${percentage}%"></div>
                </div>
                <span class="stat-value">${stat.base_stat}</span>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="pokemon-info">
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-types">${types}</div>
            <div class="pokemon-details">
                Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg<br>
                Abilities: ${abilities}
            </div>
        </div>
        <div class="stats-container">
            ${statsHtml}
        </div>
    `;
}