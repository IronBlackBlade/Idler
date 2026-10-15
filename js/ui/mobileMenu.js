/*
 * Menu mobilne (hamburger).
 *
 * Na wąskich ekranach (<= 1000 px) dotychczasowe lewe menu staje się
 * wysuwanym panelem, a na górze strony pojawia się cienki, przyklejony pasek
 * z podstawowymi informacjami o bohaterze. Pasek tylko ODCZYTUJE dane z
 * istniejących elementów (#player-hp, #player-gold itd.), więc nie zmienia
 * logiki gry. Bez tego pliku menu działa jak dawniej.
 */
(function () {
    "use strict";

    const MOBILE_QUERY = "(max-width: 1000px)";
    const SYNC_INTERVAL_MS = 400;

    let topbar = null;
    let overlay = null;
    let menuButton = null;
    let lastValues = {};

    function $(id) {
        return document.getElementById(id);
    }

    function text(id) {
        const element = $(id);

        return element ? element.textContent.trim() : "";
    }

    function fillWidth(id) {
        const element = $(id);

        return element && element.style.width ? element.style.width : "0%";
    }

    function buildTopbar() {
        topbar = document.createElement("header");
        topbar.id = "mobile-topbar";
        topbar.className = "mobile-topbar";

        topbar.innerHTML =
            '<button type="button" class="mobile-topbar-menu" ' +
            'aria-label="Otwórz menu" aria-expanded="false" aria-controls="menu">' +
            '<span class="mobile-topbar-burger" aria-hidden="true">☰</span>' +
            '<span class="mobile-topbar-dot" hidden></span>' +
            "</button>" +
            '<div class="mobile-topbar-hero">' +
            '<span class="mobile-topbar-avatar" data-mt="avatar">🐢</span>' +
            "<div>" +
            '<strong data-mt="name">Bohater</strong>' +
            '<small>Poz. <span data-mt="level">1</span><span class="mobile-topbar-screen" data-mt="screen"></span></small>' +
            "</div>" +
            "</div>" +
            '<div class="mobile-topbar-bars">' +
            '<div class="mobile-topbar-bar">' +
            "<span>❤️</span>" +
            '<div class="mobile-topbar-track"><div class="mobile-topbar-fill is-hp" data-mt="hp-fill"></div></div>' +
            '<em data-mt="hp">0</em>' +
            "</div>" +
            '<div class="mobile-topbar-bar">' +
            "<span>🔵</span>" +
            '<div class="mobile-topbar-track"><div class="mobile-topbar-fill is-mana" data-mt="mana-fill"></div></div>' +
            '<em data-mt="mana">0</em>' +
            "</div>" +
            "</div>" +
            '<div class="mobile-topbar-gold"><span data-mt="gold">0</span> 💰</div>';

        overlay = document.createElement("div");
        overlay.id = "mobile-menu-overlay";
        overlay.className = "mobile-menu-overlay";

        document.body.insertBefore(topbar, document.getElementById("layout"));
        document.body.appendChild(overlay);

        menuButton = topbar.querySelector(".mobile-topbar-menu");
    }

    function setField(name, value) {
        if (lastValues[name] === value) {
            return;
        }

        lastValues[name] = value;

        const element = topbar.querySelector('[data-mt="' + name + '"]');

        if (!element) {
            return;
        }

        if (name === "hp-fill" || name === "mana-fill") {
            element.style.width = value;
        } else {
            element.textContent = value;
        }
    }

    function getScreenTitle() {
        const screens = document.querySelectorAll(".screen");

        for (const screen of screens) {
            if (screen.style.display === "none" || !screen.offsetParent) {
                continue;
            }

            const heading = screen.querySelector("h1, h2, .card-header");
            const label = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";

            return label ? " · " + label : "";
        }

        return "";
    }

    function syncTopbar() {
        if (!topbar || document.hidden) {
            return;
        }

        const title = document.querySelector(".side-hero-title");
        const avatar = document.querySelector(".side-hero-avatar");

        setField("name", title ? title.textContent.trim() : "Bohater");
        setField("avatar", avatar ? avatar.textContent.trim() : "🐢");
        setField("level", text("player-level"));
        setField("screen", getScreenTitle());
        setField("hp", text("player-hp"));
        setField("mana", text("player-mana"));
        setField("gold", text("player-gold"));
        setField("hp-fill", fillWidth("hp-fill"));
        setField("mana-fill", fillWidth("mana-fill"));

        const points =
            (parseInt(text("player-attribute-points"), 10) || 0) +
            (parseInt(text("player-skill-points"), 10) || 0);

        const dot = topbar.querySelector(".mobile-topbar-dot");

        if (dot) {
            dot.hidden = points <= 0;
        }
    }

    function isOpen() {
        return document.body.classList.contains("mobile-menu-open");
    }

    function openMenu() {
        document.body.classList.add("mobile-menu-open");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Zamknij menu");
    }

    function closeMenu(scrollToContent) {
        document.body.classList.remove("mobile-menu-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Otwórz menu");

        if (scrollToContent) {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }

    function handleMenuClick(event) {
        const button = event.target.closest("button");

        if (!button || !isOpen()) {
            return;
        }

        // Rozwijanie grup i podmenu Bohatera nie zamyka panelu,
        // dopiero wybór ekranu lub zakładki.
        if (
            button.classList.contains("menu-category-toggle") ||
            button.classList.contains("hero-menu-toggle")
        ) {
            return;
        }

        closeMenu(true);
    }

    function init() {
        if (!$("menu") || !$("layout") || topbar) {
            return;
        }

        buildTopbar();
        document.body.classList.add("has-mobile-menu");

        menuButton.addEventListener("click", function () {
            if (isOpen()) {
                closeMenu(false);
            } else {
                openMenu();
            }
        });

        overlay.addEventListener("click", function () {
            closeMenu(false);
        });

        $("menu").addEventListener("click", handleMenuClick);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && isOpen()) {
                closeMenu(false);
                menuButton.focus();
            }
        });

        const query = window.matchMedia(MOBILE_QUERY);
        const onChange = function () {
            if (!query.matches && isOpen()) {
                closeMenu(false);
            }
        };

        if (query.addEventListener) {
            query.addEventListener("change", onChange);
        } else if (query.addListener) {
            query.addListener(onChange);
        }

        syncTopbar();
        window.setInterval(syncTopbar, SYNC_INTERVAL_MS);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
