import * as notification from './notification';
import * as badge from './badge';
import { Cycle } from './cycle';

chrome.action.onClicked.addListener(async (tab) => {
    // if we already have alarm, cancel and delete it.
    const alarms = await chrome.alarms.getAll();
    if (alarms.length > 0) {
        await chrome.alarms.clearAll();
        await notification.clearAll();
        const log = Cycle.interrupt();
        console.log("INTERRUPTED", log);
    } else {
        await chrome.alarms.clearAll();
        await notification.clearAll();
        await chrome.alarms.create('myAlarm', { periodInMinutes: 0.1 });
        const cycle = Cycle.start();
        badge.update(cycle.getBadge());
        console.log("STARTED", cycle);
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!Cycle.current) return;
    const update = Cycle.current.getUpdate();
    await badge.update(update.badge);
    await notification.notify(update.notification);
    update.next();
});
