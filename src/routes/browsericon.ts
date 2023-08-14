import * as notification from '../services/notification';
import * as badge from '../services/badge';
import { Router } from "../chomexx/router";
import { Cycle } from '../domains/cycle';

const browsericon = new Router<chrome.tabs.Tab, { alarms?: chrome.alarms.Alarm[] }>(async () => {
    const alarms = await chrome.alarms.getAll();
    if (alarms.length == 0) return { name: 'empty' };
    return { name: 'exist', alarms };
});

browsericon.on('empty', async () => {
    await chrome.alarms.clearAll();
    await notification.clearAll();
    await chrome.alarms.create('myAlarm', { periodInMinutes: 0.1 });
    const cycle = Cycle.start();
    badge.update(cycle.getBadge(cycle.getStatus()));
    console.log("STARTED", cycle);
});

browsericon.on('exist', async () => {
    await chrome.alarms.clearAll();
    await notification.clearAll();
    const log = Cycle.interrupt();
    console.log("INTERRUPTED", log);
});

export default browsericon;
