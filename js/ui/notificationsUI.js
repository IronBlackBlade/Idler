function showNotification(message, type = "info") {
    let container = document.getElementById("notifications-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "notifications-container";
        document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}