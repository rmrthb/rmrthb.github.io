const API_BASE = 'https://pokeapi.co/api/v2';

async function fetchGeneration(genId) {
    const response = await fetch(`${API_BASE}/generation/${genId}/`);
    if (!response.ok) throw new Error('Failed to fetch generation');
    return response.json();
}

async function fetchAllGenerations() {
    const response = await fetch(`${API_BASE}/generation/`);
    if (!response.ok) throw new Error('Failed to fetch generations');
    return response.json();
}

async function fetchPokemon(nameOrId) {
    const response = await fetch(`${API_BASE}/pokemon/${nameOrId}/`);
    if (!response.ok) throw new Error('Failed to fetch pokemon');
    return response.json();
}

async function getRandomPokemonFromGeneration(genId) {
    let pokemonList = [];
    
    if (genId === 'all') {
        const generations = await fetchAllGenerations();
        const allGenPromises = generations.results.map(gen => fetch(gen.url).then(r => r.json()));
        const allGens = await Promise.all(allGenPromises);
        allGens.forEach(gen => {
            pokemonList = pokemonList.concat(gen.pokemon_species);
        });
    } else {
        const generation = await fetchGeneration(genId);
        pokemonList = generation.pokemon_species;
    }
    
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const selectedSpecies = pokemonList[randomIndex];
    const pokemonName = selectedSpecies.name;
    
    return fetchPokemon(pokemonName);
}