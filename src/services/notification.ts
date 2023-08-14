
export function clearAll() {
    return new Promise(resolve => {
        chrome.notifications.getAll(notifications => {
            Promise.all(Object.keys(notifications).map(id => new Promise(res => {
                chrome.notifications.clear(id, res);
            }))).then(resolve);
        });
    });
}

export function notify(notification?: { id: string, opt: chrome.notifications.NotificationOptions<true> }): Promise<string|void> {
    if (!notification) return Promise.resolve();
    console.log(notification);
    return new Promise(resolve => {
        chrome.notifications.create(notification.id, notification.opt, resolve);
    });
}