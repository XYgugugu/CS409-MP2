import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className={styles.nav}>
            <div className={styles.left}>
                <div className={styles.logo}>Pokédex Mini-Wiki</div>
            </div>

            <div className={styles.center}>
                <div className={styles.links}>
                    <Link
                        to="/"
                        className={location.pathname === "/" ? styles.active : ""}
                    >
                        List
                    </Link>
                    <Link
                        to="/gallery"
                        className={location.pathname === "/gallery" ? styles.active : ""}
                    >
                        Gallery
                    </Link>
                </div>
            </div>

            <div className={styles.right}></div>
        </nav>
    );
};

export default NavBar;
