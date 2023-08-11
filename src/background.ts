
chrome.action.onClicked.addListener(async (tab) => {
    // if we already have alarm, cancel and delete it.
    const alarms = await chrome.alarms.getAll();
    if (alarms.length > 0) {
        await chrome.alarms.clearAll();
        console.log("STOPPED");
    } else {
        // Every 5 seconds
        await chrome.alarms.create('myAlarm', { periodInMinutes: 0.1 });
        console.log("STARTED");
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log(alarm);
    const txt = (await chrome.action.getBadgeText({})) ?? 'false';
    console.log(txt);
    chrome.action.setBadgeText({ text: `${!!!txt}` });
});
