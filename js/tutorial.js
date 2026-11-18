/*
 * Krótki samouczek dla początkujących.
 *
 * - Pokazuje się sam nowej postaci (poziom 1, bez postępu); starych zapisów nie dotyka.
 * - Każdy krok ma przycisk „Pokaż”, który otwiera odpowiedni ekran gry.
 * - Można go pominąć i otworzyć ponownie w Ustawieniach (openTutorial()).
 * - Stan: player.tutorialDone (zapisuje się razem z postacią).
 */
const TUTORIAL_STEPS = Object.freeze([
    {
        icon: "👋",
        title: "Witaj w Idlerze!",
        text: [
            "Bohater walczy i rozwija się sam, także gdy nie patrzysz. Ty decydujesz, gdzie walczy, czym się wyposaża i jak rozdaje punkty.",
            "Gdy zamkniesz kartę, postęp biegnie dalej, a po powrocie zobaczysz podsumowanie nieobecności."
        ]
    },
    {
        icon: "⚔️",
        title: "Polowanie",
        text: [
            "W zakładce Polowanie wybierasz lokację. Walka z potworami daje EXP, złoto i łupy.",
            "Nowe lokacje odblokowują się wraz z poziomem. Pokonanie bossa lokacji daje wyjątkowe nagrody."
        ],
        action: { label: "Pokaż Polowanie", run: () => typeof openHuntingScreen === "function" && openHuntingScreen() }
    },
    {
        icon: "💪",
        title: "Punkty atrybutów",
        text: [
            "Za każdy poziom dostajesz punkty atrybutów. Rozdaj je w Bohater → Atrybuty, żeby wzmocnić postać.",
            "Zielona kropka lub liczba przy Bohaterze przypomina o nierozdanych punktach."
        ],
        action: { label: "Pokaż Atrybuty", run: () => typeof openHeroTab === "function" && openHeroTab("attributes") }
    },
    {
        icon: "🛡️",
        title: "Wyposażenie i plecak",
        text: [
            "Przedmioty z łupów trafiają do Plecaka. Lepszy sprzęt zakładasz w Wyposażeniu.",
            "Zbędne rzeczy sprzedasz w Sklepie (Miasto), a w Plecaku możesz je wyszukiwać i sortować."
        ],
        action: { label: "Pokaż Wyposażenie", run: () => typeof openHeroTab === "function" && openHeroTab("equipment") }
    },
    {
        icon: "⛏️",
        title: "Zawody i materiały",
        text: [
            "Kopalnia, Zielarstwo, Ogród i Łowienie dają materiały. Przydadzą się w Rzemiośle, Alchemii i Gotowaniu.",
            "Zawody zdobywają własne poziomy, więc warto je rozwijać obok walki."
        ],
        action: { label: "Pokaż Kopalnię", run: () => typeof openMiningScreen === "function" && openMiningScreen() }
    },
    {
        icon: "🔨",
        title: "Rzemiosło i Kuźnia",
        text: [
            "Z materiałów tworzysz lepszy sprzęt w Mieście → Rzemiosło, a w Kuźni ulepszasz posiadane przedmioty.",
            "Ulepszanie kosztuje złoto, więc zbieraj je także na później."
        ],
        action: { label: "Pokaż Rzemiosło", run: () => typeof showScreen === "function" && showScreen("screen-crafting") }
    },
    {
        icon: "🗝️",
        title: "Lochy",
        text: [
            "Boss lokacji może upuścić klucz do lochu. Wyprawa kosztuje klucz i trochę złota, ale kończy się cennymi trofeami.",
            "Porażka albo opuszczenie lochu kończy wyprawę, więc wchodź dobrze przygotowany."
        ],
        action: { label: "Pokaż Lochy", run: () => typeof showScreen === "function" && showScreen("screen-dungeons") }
    },
    {
        icon: "📜",
        title: "Zadania i osiągnięcia",
        text: [
            "Zadania dzienne i tygodniowe dają nagrody. W Dzienniku znajdziesz osiągnięcia, bestiariusz i opisy materiałów.",
            "Osiągnięcia odblokowują tytuły i avatary."
        ],
        action: { label: "Pokaż Dziennik", run: () => typeof openJournal === "function" && openJournal() }
    },
    {
        icon: "💾",
        title: "Zapis, konto i avatar",
        text: [
            "Gra zapisuje się sama w przeglądarce. Przed czyszczeniem danych przeglądarki wyeksportuj zapis w Ustawieniach.",
            "Konto online daje zapis w chmurze, ranking i czat. Avatar zmienisz klikając portret bohatera."
        ],
        action: { label: "Pokaż Ustawienia", run: () => typeof showScreen === "function" && showScreen("screen-settings") }
    },
    {
        icon: "🎉",
        title: "Powodzenia!",
        text: [
            "To wszystko na start. Samouczek możesz otworzyć ponownie w Ustawieniach → Samouczek."
        ]
    }
]);

let tutorialStep = 0;
let tutorialNode = null;

function isTutorialOpen() {
    return Boolean(tutorialNode);
}

function finishTutorial(markDone) {
    if (tutorialNode) {
        tutorialNode.remove();
        tutorialNode = null;
    }
    if (markDone && player && !player.tutorialDone) {
        player.tutorialDone = true;
        if (typeof saveGame === "function") {
            saveGame();
        }
    }
}

function renderTutorial() {
    if (!tutorialNode) {
        return;
    }
    const step = TUTORIAL_STEPS[tutorialStep];
    const last = tutorialStep === TUTORIAL_STEPS.length - 1;
    tutorialNode.replaceChildren();

    const header = document.createElement("div");
    header.className = "tutorial-header";
    const title = document.createElement("strong");
    title.textContent = step.icon + " " + step.title;
    const counter = document.createElement("span");
    counter.className = "tutorial-counter";
    counter.textContent = (tutorialStep + 1) + " / " + TUTORIAL_STEPS.length;
    header.appendChild(title);
    header.appendChild(counter);
    tutorialNode.appendChild(header);

    step.text.forEach((line) => {
        const paragraph = document.createElement("p");
        paragraph.className = "tutorial-text";
        paragraph.textContent = line;
        tutorialNode.appendChild(paragraph);
    });

    const actions = document.createElement("div");
    actions.className = "tutorial-actions";

    if (step.action) {
        const show = document.createElement("button");
        show.type = "button";
        show.className = "tutorial-show";
        show.textContent = "👉 " + step.action.label;
        show.addEventListener("click", () => {
            try {
                step.action.run();
            } catch (error) {
                console.error(error);
            }
        });
        actions.appendChild(show);
    }

    const skip = document.createElement("button");
    skip.type = "button";
    skip.className = "tutorial-skip";
    skip.textContent = last ? "" : "Pomiń";
    skip.hidden = last;
    skip.addEventListener("click", () => finishTutorial(true));

    const back = document.createElement("button");
    back.type = "button";
    back.className = "tutorial-back";
    back.textContent = "Wstecz";
    back.disabled = tutorialStep === 0;
    back.addEventListener("click", () => {
        tutorialStep = Math.max(0, tutorialStep - 1);
        renderTutorial();
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "tutorial-next";
    next.textContent = last ? "Zakończ" : "Dalej";
    next.addEventListener("click", () => {
        if (last) {
            finishTutorial(true);
        } else {
            tutorialStep += 1;
            renderTutorial();
        }
    });

    actions.appendChild(skip);
    actions.appendChild(back);
    actions.appendChild(next);
    tutorialNode.appendChild(actions);
}

function openTutorial() {
    finishTutorial(false);
    tutorialStep = 0;
    tutorialNode = document.createElement("section");
    tutorialNode.id = "tutorial-card";
    tutorialNode.className = "tutorial-card";
    tutorialNode.setAttribute("role", "dialog");
    tutorialNode.setAttribute("aria-label", "Samouczek");
    document.body.appendChild(tutorialNode);
    renderTutorial();
}

function isFreshCharacter() {
    return (Number(player.level) || 1) <= 1 &&
        !(Number(player.exp) > 0) &&
        !(Number(player.totalKills) > 0) &&
        !(Number(player.stats?.totalKills) > 0);
}

function startTutorialIfNeeded() {
    if (typeof player === "undefined" || !player || player.tutorialDone || isTutorialOpen()) {
        return true;
    }
    if (!isFreshCharacter()) {
        // Stara postać z postępem: samouczek nie pokazuje się sam.
        player.tutorialDone = true;
        return true;
    }
    if (document.querySelector(".game-dialog-overlay")) {
        // Otwarte okno (np. logowanie): spróbujemy ponownie za chwilę.
        return false;
    }
    openTutorial();
    return true;
}

/*
 * Nowe konto online: samouczek uruchamia się automatycznie przy pierwszym
 * zalogowaniu (konto założone przed chwilą), także gdy na urządzeniu jest już
 * jakaś postać. Dla każdego konta tylko raz.
 */
const TUTORIAL_NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

function onTutorialAccountState(state) {
    try {
        const user = state && state.status === "signedIn" ? state.user : null;
        const createdAt = user && Date.parse(user.created_at);

        if (!user || !Number.isFinite(createdAt)) {
            return;
        }
        if (Date.now() - createdAt > TUTORIAL_NEW_ACCOUNT_WINDOW_MS) {
            return;
        }

        const key = "idler_tutorial_account_" + user.id;

        if (localStorage.getItem(key)) {
            return;
        }

        localStorage.setItem(key, "1");

        if (!isTutorialOpen()) {
            openTutorial();
        }
    } catch (error) {
        // localStorage może być niedostępny; samouczek wtedy startuje zwykłą drogą.
    }
}

window.IdlerTutorial = { open: openTutorial, close: () => finishTutorial(true), isOpen: isTutorialOpen };

(function scheduleTutorial() {
    let attempts = 0;
    const timer = window.setInterval(() => {
        attempts += 1;

        if (startTutorialIfNeeded() || attempts >= 120) {
            window.clearInterval(timer);
        }
    }, 2500);

    // Konta ładują się po tym pliku, więc podpinamy się po załadowaniu strony.
    const connectAccounts = () => {
        const accounts = window.IdlerAccounts;

        if (accounts && typeof accounts.subscribe === "function") {
            accounts.subscribe(onTutorialAccountState);
            onTutorialAccountState(accounts.getState?.());
        }
    };

    if (document.readyState === "complete") {
        connectAccounts();
    } else {
        window.addEventListener("load", connectAccounts);
    }
})();
