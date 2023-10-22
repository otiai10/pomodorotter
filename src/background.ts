
// import browsericon from './routes/browsericon';
// chrome.action.onClicked.addListener(browsericon.listener());

// import alarm from './routes/alarm';
// chrome.alarms.onAlarm.addListener(alarm.listener());

import { Router } from "chromite";

const r = new Router<chrome.runtime.ExtensionMessageEvent>();

r.on("/test", async function(m, s) {
    console.log(m, s);
    return "hoge";
});
r.onNotFound(async function(m, s) {
    console.log("not found");
    console.log(m, s);
});

console.log(r.listener());
chrome.runtime.onMessage.addListener(r.listener());


// chrome.runtime.onMessage.addListener((m, s, r) => {
//     console.log(m, s, r);
// });