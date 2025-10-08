import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPokemonList, PokemonListItem } from "../api/pokemonAPI";
import SearchBar from "../components/SearchBar";
import styles from "./ListView.module.css";

const LIMIT = 100;

enum SortStatus {
    None = "none",
    ASC = "asc",
    DESC = "desc",
}

enum AttributeSortStatus {
    None = "none",
    hp = "hp",
    attack = "attack",
    defense = "defense",
    special_attack = "special-attack",
    special_defense = "special-defense",
    speed = "speed",
}

const STAT_ICONS: Record<string, string> = {
    hp: "❤️",
    attack: "⚔️",
    defense: "🛡️",
    "special-attack": "💥",
    "special-defense": "🧠",
    speed: "⚡",
};

function ListView() {
    const [allPokemons, setAllPokemons] = useState<PokemonListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState(SortStatus.None);
    const [attributeSort, setAttributeSort] = useState(AttributeSortStatus.None);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPokemonList(2000, 0, "");
            setAllPokemons(data);
        } catch (error) {
            console.error("Failed to fetch Pokémon list:", error);
            setAllPokemons([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
      setPage(0);
    }, [search]);

    const handleNextPage = useCallback(() => {
        setPage((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handlePrevPage = useCallback(() => {
        setPage((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const activeClass = (condition: boolean) =>
        condition ? styles.active : undefined;

    const filtered = useMemo(() => {
      if (!search.trim()) return allPokemons;
      return allPokemons.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }, [allPokemons, search]);


    const sorted = useMemo(() => {
        const copy = [...filtered];

        if (attributeSort !== AttributeSortStatus.None) {
            const key = attributeSort as string;
            const order = sortOrder === SortStatus.DESC ? -1 : 1;
            copy.sort((a, b) => {
                const aVal = a.stats.find((s) => s.name === key)?.value ?? 0;
                const bVal = b.stats.find((s) => s.name === key)?.value ?? 0;
                return (aVal - bVal) * order;
            });
        } else if (sortOrder !== SortStatus.None) {
            copy.sort((a, b) =>
                sortOrder === SortStatus.ASC
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            );
        }

        return copy;
    }, [filtered, sortOrder, attributeSort]);

    const paginated = useMemo(() => {
        const start = page * LIMIT;
        return sorted.slice(start, start + LIMIT);
    }, [sorted, page]);

    const totalPages = Math.ceil(sorted.length / LIMIT);
    const isLastPage = page >= totalPages - 1;

    const PaginationControls = () => (
        <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={page === 0}>
                ← Previous
            </button>
            <span>
                Page {page + 1} of {totalPages || 1}
            </span>
            <button onClick={handleNextPage} disabled={isLastPage}>
                Next →
            </button>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <SearchBar value={search} onChange={setSearch} />

            <div className={styles.sortButtons}>
                <span>Sort Order:</span>
                <button
                    className={activeClass(sortOrder === SortStatus.ASC)}
                    onClick={() =>
                        setSortOrder((prev) =>
                            prev === SortStatus.ASC ? SortStatus.None : SortStatus.ASC
                        )
                    }
                >
                    Ascending
                </button>
                <button
                    className={activeClass(sortOrder === SortStatus.DESC)}
                    onClick={() =>
                        setSortOrder((prev) =>
                            prev === SortStatus.DESC ? SortStatus.None : SortStatus.DESC
                        )
                    }
                >
                    Descending
                </button>
            </div>

            <div className={styles.attrSortButtons}>
                <span>Sort by stat:</span>
                {(Object.keys(STAT_ICONS) as (keyof typeof STAT_ICONS)[]).map((key) => (
                    <button
                        key={key}
                        className={activeClass(attributeSort === key)}
                        onClick={() =>
                            setAttributeSort((prev) =>
                                prev === key
                                    ? AttributeSortStatus.None
                                    : (key as AttributeSortStatus)
                            )
                        }
                    >
                        {STAT_ICONS[key]}
                    </button>
                ))}
            </div>

            <PaginationControls />

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.container}>
                    {paginated.length > 0 ? (
                        paginated.map((p) => (
                            <Link
                                key={p.id}
                                to={`/pokemon/${p.id}`}
                                state={{ from: "list" , orderedIds: sorted.map((x) => x.id) }}
                                className={styles.cardLink}
                            >
                                <div className={`${styles.card} ${styles[p.types[0]]}`}>
                                    <div className={styles.header}>
                                        <img
                                            src={p.icon}
                                            alt={`${p.name} icon`}
                                            className={styles.icon}
                                        />
                                        <h3>
                                            #{p.id.toString().padStart(3, "0")} {p.name}
                                        </h3>
                                    </div>

                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className={styles.image}
                                    />

                                    <div className={styles.types}>
                                        {p.types.map((t) => (
                                            <span
                                                key={t}
                                                className={`${styles.type} ${styles[t.toLowerCase()]}`}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <div className={styles.stats}>
                                        {p.stats.map((s) => (
                                            <div key={s.name} className={styles.stat}>
                                                <span className={styles.statIcon}>
                                                    {STAT_ICONS[s.name] ?? "•"}
                                                </span>
                                                <span>{s.value}</span>
                                            </div>
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

            <PaginationControls />
        </div>
    );
}

export default ListView;
