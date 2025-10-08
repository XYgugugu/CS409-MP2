import axios from "axios";

const API_BASE = "https://pokeapi.co/api/v2";

export interface PokemonListItem {
    id: number;
    name: string;
    image: string; // official artwork
    icon: string; // small sprite icon
    types: string[];
    stats: { name: string; value: number }[];
}

export async function getPokemonList(
    limit = 20,
    offset = 0,
    searchTerm = ""
): Promise<PokemonListItem[]> {
    let response;

    if (searchTerm) {
        response = await axios.get<{ results: { name: string; url: string }[] }>(
            `${API_BASE}/pokemon?limit=2000&offset=0`
        );
    } else {
        response = await axios.get<{ results: { name: string; url: string }[] }>(
            `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`
        );
    }

    const list = response.data.results;

    interface PokemonDetailResponse {
        name: string;
        sprites: {
            front_default: string;
            other: {
                ["official-artwork"]: { front_default: string };
            };
        };
        types: { type: { name: string } }[];
        stats: { stat: { name: string }; base_stat: number }[];
    }

    const detailed = await Promise.all(
        list.map(async (item) => {
            const id = parseInt(item.url.split("/").filter(Boolean).pop()!, 10);
            try {
                const res = await axios.get<PokemonDetailResponse>(
                    `${API_BASE}/pokemon/${id}`
                );
                const d = res.data;

                return {
                    id,
                    name: d.name,
                    image:
                        d.sprites.other["official-artwork"].front_default ||
                        d.sprites.front_default,
                    icon: d.sprites.front_default,
                    types: d.types.map((t) => t.type.name),
                    stats: d.stats.map((s) => ({
                        name: s.stat.name,
                        value: s.base_stat,
                    })),
                } as PokemonListItem;
            } catch {
                return null;
            }
        })
    );

    const results = detailed.filter((p): p is PokemonListItem => p !== null);

    let filtered = results;
    if (searchTerm) {
        filtered = results.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
}
