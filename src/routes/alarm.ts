import * as badge from "../services/badge";
import * as notification from "../services/notification";
import { Router } from "../chomexx/router";
import { Cycle, TransitionStatus } from "../domains/cycle";
import { EndState } from "../domains/timebox";

const alarm = new Router<chrome.alarms.Alarm>(async () => {
    return { name: 'fire' };
});

alarm.on('fire', async (payload) => {
    const current = Cycle.current;
    if (!current) return;
    const status = current.getStatus();
    await badge.update(current.getBadge(status));
    await notification.notify(current.getNotification(status));

    switch (status) {
        case TransitionStatus.FocusJustEnded:
            current.focus.endstate = EndState.Completed;
            chrome.tabs.create({ url: 'https://www.youtube.com/watch?v=Lx0N27LTwYg' });
            break;
        case TransitionStatus.RelaxJustEnded:
            current.relax.endstate = EndState.Completed;
            chrome.tabs.create({ url: 'https://www.youtube.com/watch?v=QH2-TGUlwu4' });
            break;
    }
});

export default alarm;
