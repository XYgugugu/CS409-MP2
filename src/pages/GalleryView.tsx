import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPokemonList, PokemonListItem } from "../api/pokemonAPI";
import { getAllTypes, PokemonType } from "../api/typeAPI";
import styles from "./GalleryView.module.css";

const GalleryView: React.FC = () => {
  const [allPokemons, setAllPokemons] = useState<PokemonListItem[]>([]);
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pokemonData, typeData] = await Promise.all([
          getPokemonList(2000, 0, ""),
          getAllTypes(),
        ]);
        setAllPokemons(pokemonData);
        setTypes(typeData);
      } catch (err) {
        console.error("Failed to load gallery data:", err);
        setAllPokemons([]);
        setTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleType = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const filteredPokemons = useMemo(() => {
    if (activeTypes.length === 0) return allPokemons;

    return allPokemons.filter((pokemon) =>
      pokemon.types.some((t) => activeTypes.includes(t.toLowerCase()))
    );
  }, [allPokemons, activeTypes]);

  return (
    <div className={styles.wrapper}>
      {/* Type Filter */}
      <div className={styles.filterButtons}>
        <span>Filter by type:</span>
        {types.map((type) => {
          const isActive = activeTypes.includes(type.name);
          return (
            <button
              key={type.name}
              className={`${styles.typeButton} ${
                isActive ? `${styles.active} ${styles[type.name]}` : ""
              }`}
              onClick={() => toggleType(type.name)}
            >
              {type.name}
            </button>
          );
        })}
      </div>

      {/* Gallery */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.grid}>
          {filteredPokemons.length > 0 ? (
            filteredPokemons.map((pokemon) => (
              <Link
                key={pokemon.id}
                to={`/pokemon/${pokemon.id}`}
                state={{
                  from: "gallery",
                  orderedIds: filteredPokemons.map((p) => p.id),
                }}
                className={styles.cardLink}
              >
                <div className={`${styles.card} ${styles[pokemon.types[0]]}`}>
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className={styles.image}
                  />
                  <h3>
                    #{pokemon.id.toString().padStart(3, "0")} {pokemon.name}
                  </h3>

                  <div className={styles.types}>
                    {pokemon.types.map((t) => (
                      <span
                        key={t}
                        className={`${styles.type} ${styles[t.toLowerCase()]}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.noResults}>No Pokémon found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryView;
