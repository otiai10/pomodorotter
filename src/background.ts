
import browsericon from './routes/browsericon';
chrome.action.onClicked.addListener(browsericon.listener());

import alarm from './routes/alarm';
chrome.alarms.onAlarm.addListener(alarm.listener());
