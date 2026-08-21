function showNotification(
    message,
    type = "success"
) {
    let container =
        document.getElementById(
            "notification-container"
        );

    if (!container) {
        container =
            document.createElement("div");

        container.id =
            "notification-container";

        container.className =
            "notification-container";

        document.body.appendChild(container);
    }

    Object.assign(
        container.style,
        {
            position: "fixed",
            top: "18px",
            right: "18px",
            bottom: "auto",
            left: "auto",
            width: "340px",
            maxWidth: "calc(100vw - 36px)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            margin: "0",
            zIndex: "999999",
            pointerEvents: "none"
        }
    );

    const notification =
        document.createElement("div");

    notification.className =
        "game-notification " +
        "notification-" +
        type;

    notification.textContent =
        message;

    notification.style.pointerEvents =
        "auto";

    container.appendChild(
        notification
    );

    requestAnimationFrame(() => {
        notification.classList.add(
            "notification-visible"
        );
    });

    setTimeout(() => {
        notification.classList.remove(
            "notification-visible"
        );

        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2500);
}