/* Na telefonie kliknięcie w nazwę atrybutu pokazuje/ukrywa opis jego działania. */
document.addEventListener("click", (event) => {
    const header = event.target.closest?.(".hero-attribute-main > div:first-child");

    if (!header || event.target.closest("button")) {
        return;
    }

    header.closest(".hero-attribute-card")?.classList.toggle("expanded");
});
