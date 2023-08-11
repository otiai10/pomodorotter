
export function update(badge?: { text: string, color: { text: string, bg: string } }): Promise<void> {
    if (!badge) {
        chrome.action.setBadgeText({ text: '' });
    } else {
        chrome.action.setBadgeText({ text: badge.text });
        chrome.action.setBadgeBackgroundColor({ color: badge.color.bg });
        chrome.action.setTitle({ title: badge.text });
    }
    return Promise.resolve();
}
