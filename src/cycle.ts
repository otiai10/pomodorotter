import { Setting } from './setting';
import { Timebox } from './timebox';

export class Cycle {
    private static _current_: Cycle | null = null;
    public static get current(): Cycle | null {
        return Cycle._current_;
    }
    constructor(
        public focus: Timebox,
        public relax: Timebox,
    ) {}
    private static next(start = Date.now(), setting = new Setting()): Cycle {
        return new Cycle(
            Timebox.focus(setting.focusMin, start),
            Timebox.relax(setting.relaxMin, start + setting.focusMin * 60 * 1000),
        );
    }
    public static start(start = Date.now(), setting = new Setting()): Cycle {
        return Cycle._current_ = Cycle.next(start, setting);
    }
    private static clear() {
        Cycle._current_ = null;
    }
    public static interrupt(now = Date.now()) {
        // Interrupt should terminate this cycle anyway.
        Cycle._current_?.interrupt(now);
        const log = Cycle._current_?.log();
        Cycle.clear();
        return log;
    }
    public interrupt(now = Date.now()) {
        if (now < this.focus.end) {
            this.focus.interrupt();
        } else if (now < this.relax.end) {
            this.focus.complete();
            this.relax.interrupt();
        }
        this.focus.complete();
        this.relax.complete();
    }

    // -- Update --
    public getUpdate(now = Date.now()): {
        notification: { id: string, opt: chrome.notifications.NotificationOptions<true> } | undefined,
        badge: { text: string, color: { text: string, bg: string } } | undefined,
        next: () => void,
    } {
        const notification = this.getNotification(now);
        const badge = this.getBadge(now);
        const next = this.getNextAction(now);
        return { notification, badge, next };
    }

    // -- Log --
    public log(): any {
        return {...this};
    }

    // -- Notification --
    private getNotification(now = Date.now()): { id: string, opt: chrome.notifications.NotificationOptions<true> } | undefined {
        if (now < this.focus.end) {
            return;
        }
        if (this.focus.end <= now && this.focus.endstate == null) {
            this.focus.complete();
            return {
                id: 'timebox_focus_completed',
                opt: {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('icons/icon_32.png'),
                    title: 'Congrats!',
                    message: 'Focus time completed',
                },
            }; // End-of-focus notification
        }
        if (now < this.relax.end) {
            return;
        }
        if (this.relax.end <= now && this.relax.endstate == null) {
            this.relax.complete();
            return {
                id: 'timebox_relax_completed',
                opt: {
                    type: 'list',
                    iconUrl: chrome.runtime.getURL('icons/icon_32.png'),
                    title: 'Got relaxed?',
                    message: 'Relax time completed',
                    items: [
                        { title: 'Start Next Cycle', message: 'Focus again' },
                        { title: 'Exit for now', message: 'Terminate POMODORO to relax more' },
                    ],
                },
            }; // End-of-relax notification
        }
        return;
    }

    // -- Badge --
    public getBadge(now = Date.now()): { text: string, color: { text: string, bg: string } } {
        const { focus, relax } = this;
        if (now < focus.end) {
            const min = Math.floor((focus.end - now) / 1000 / 60);
            return { text: `${min}m`, color: { text: 'white', bg: 'blue' } };
        } else if (now < relax.end) {
            const min = Math.floor((relax.end - now) / 1000 / 60);
            return { text: `${min}m`, color: { text: 'white', bg: 'cyan' } };
        }
        return { text: '', color: { text: 'black', bg: 'white' } };
    }

    // -- NextAction --
    private getNextAction(now = Date.now()): () => void {
        if (this.relax.end <= now) {
            return () => Cycle.clear();
        }
        return () => { };
    }
}
