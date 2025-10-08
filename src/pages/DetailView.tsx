import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "./DetailView.module.css";

const API_BASE = "https://pokeapi.co/api/v2";

interface PokemonDetail {
    id: number;
    name: string;
    height: number;
    weight: number;
    base_experience: number;
    sprites: {
        other: {
            ["official-artwork"]: { front_default: string };
        };
    };
    types: { type: { name: string } }[];
    abilities: { ability: { name: string }; is_hidden: boolean }[];
    stats: { stat: { name: string }; base_stat: number }[];
    species: { url: string };
}

interface SpeciesDetail {
    flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}

const DetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
    const [flavor, setFlavor] = useState<string>("");

    const location = useLocation();
    const orderedIds: number[] = location.state?.orderedIds;
    const fromPage: string = location.state?.from || "list";
    const currentId = parseInt(id ?? "1", 10);
    const index = orderedIds ? orderedIds.indexOf(currentId) : -1;
    const prevId = index > 0 ? orderedIds[index - 1] : null;
    const nextId =
        index >= 0 && index < orderedIds.length - 1 ? orderedIds[index + 1] : null;

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await axios.get<PokemonDetail>(
                    `${API_BASE}/pokemon/${id}`
                );
                setPokemon(data);

                const speciesRes = await axios.get<SpeciesDetail>(data.species.url);
                const entry = speciesRes.data.flavor_text_entries.find(
                    (f) => f.language.name === "en"
                );
                setFlavor(entry?.flavor_text.replace(/\f/g, " ") ?? "");
            } catch (err) {
                console.error("Failed to fetch Pokémon details:", err);
            }
        }

        fetchData();
    }, [id]);

    if (!pokemon)
        return (
            <div className={styles.detailPage}>
                <p className={styles.loading}>Loading...</p>
            </div>
        );

    const formattedName =
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const formattedHeight = (pokemon.height / 10).toFixed(1);
    const formattedWeight = (pokemon.weight / 10).toFixed(1);

    return (
        <div className={styles.detailPage}>
            <div className={`${styles.detailCard} ${styles[pokemon.types[0].type.name]}`}>
                <div className={styles.detailNavButtons}>
                    {prevId ? (
                        <Link
                            to={`/pokemon/${prevId}`}
                            state={{ orderedIds }}
                            className={styles.navButton}
                        >
                            ← Prev
                        </Link>
                    ) : (
                        <span className={styles.navButtonDisabled}>← First</span>
                    )}

                    {nextId ? (
                        <Link
                            to={`/pokemon/${nextId}`}
                            state={{ orderedIds }}
                            className={styles.navButton}
                        >
                            Next →
                        </Link>
                    ) : (
                        <span className={styles.navButtonDisabled}>Last →</span>
                    )}
                </div>

                <h2 className={styles.detailTitle}>
                    #{pokemon.id.toString().padStart(3, "0")} {formattedName}
                </h2>

                <img
                    className={styles.detailImage}
                    src={pokemon.sprites.other["official-artwork"].front_default}
                    alt={pokemon.name}
                />

                <div className={styles.types}>
                    {pokemon.types.map((t) => (
                        <span
                            key={t.type.name}
                            className={`${styles.type} ${styles[t.type.name]}`}
                        >
                            {t.type.name}
                        </span>
                    ))}
                </div>

                <div className={styles.infoGroup}>
                    <p>
                        <strong>Height:</strong> {formattedHeight} m
                    </p>
                    <p>
                        <strong>Weight:</strong> {formattedWeight} kg
                    </p>
                    <p>
                        <strong>Base XP:</strong> {pokemon.base_experience}
                    </p>
                </div>

                <div className={styles.section}>
                    <h3>Abilities</h3>
                    <ul>
                        {pokemon.abilities.map((a) => (
                            <li key={a.ability.name}>
                                {a.ability.name}
                                {a.is_hidden && (
                                    <span className={styles.hiddenTag}> (hidden)</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>Stats</h3>
                    <ul className={styles.statList}>
                        {pokemon.stats.map((s) => (
                            <li key={s.stat.name}>
                                <span className={styles.statName}>{s.stat.name}</span>
                                <span className={styles.statValue}>{s.base_stat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {flavor && (
                    <blockquote className={styles.detailBlockquote}>
                        “{flavor}”
                    </blockquote>
                )}

                <Link to={fromPage === "gallery" ? "/gallery" : "/"} className={styles.detailBack}>
                    ← Back to {fromPage === "gallery" ? "Gallery" : "List"}
                </Link>
            </div>
        </div>
    );
};

export default DetailView;
