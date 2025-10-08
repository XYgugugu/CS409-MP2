import axios from "axios";

const API_BASE = "https://pokeapi.co/api/v2";

export interface PokemonType {
    name: string;
    url: string;
}

export async function getAllTypes(): Promise<PokemonType[]> {
    try {
        const response = await axios.get<{ results: PokemonType[] }>(
            `${API_BASE}/type`
        );
        return response.data.results.filter(
            (t) => !["shadow", "unknown"].includes(t.name)
        );
    } catch (err) {
        console.error("Failed to fetch Pokémon types:", err);
        return [];
    }
}
