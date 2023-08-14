import { Setting } from './setting';
import { Timebox } from './timebox';

export enum TransitionStatus {
    OnFocus = 'on_focus',
    FocusJustEnded = 'focus_just_ended',
    OnRelax = 'on_relax',
    RelaxJustEnded = 'relax_just_ended',
    Completed = 'completed',
}

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

    // -- Status --
    public getStatus(now = Date.now()): TransitionStatus {
        if (now < this.focus.end) {
            return TransitionStatus.OnFocus;
        }
        if (this.focus.endstate == null && now < this.relax.end) {
            return TransitionStatus.FocusJustEnded;
        }
        if (now < this.relax.end) {
            return TransitionStatus.OnRelax;
        }
        if (this.relax.endstate == null) {
            return TransitionStatus.RelaxJustEnded;
        }
        return TransitionStatus.Completed;
    }

    // -- Log --
    public log(): any {
        return {...this};
    }

    // -- Notification --
    public shouldNotify(status: TransitionStatus): boolean {
        switch (status) {
            case TransitionStatus.OnFocus:
            case TransitionStatus.OnRelax:
                return false;
            case TransitionStatus.FocusJustEnded:
            case TransitionStatus.RelaxJustEnded:
            case TransitionStatus.Completed:
                return true;
        }
    }
    public getNotification(status: TransitionStatus, now = Date.now()): { id: string, opt: chrome.notifications.NotificationOptions<true> } | undefined {
        switch (status) {
            case TransitionStatus.OnFocus:
            case TransitionStatus.OnRelax:
                return;
        }
        if (status == TransitionStatus.FocusJustEnded) {
            return {
                id: 'timebox_focus_completed',
                opt: {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('icons/red/48.png'),
                    title: 'Congrats!',
                    message: 'Focus time completed',
                },
            };
        }
        if (status == TransitionStatus.RelaxJustEnded) {
            return {
                id: 'timebox_relax_completed',
                opt: {
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('icons/red/48.png'),
                    title: 'Relaxed?',
                    message: 'Relax time completed',
                },
            }; // End-of-relax notification
        }
        return;
    }

    // -- Badge --
    public getBadge(status: TransitionStatus, now = Date.now()): { text: string, color: { text: string, bg: string } } {
        const { focus, relax } = this;
        if (now < focus.end) {
            const min = Math.floor((focus.end - now) / 1000 / 60);
            return { text: `${min}`, color: { text: 'white', bg: 'blue' } };
        } else if (now < relax.end) {
            const min = Math.floor((relax.end - now) / 1000 / 60);
            return { text: `${min}`, color: { text: 'white', bg: 'cyan' } };
        }
        return { text: '', color: { text: 'black', bg: 'white' } };
    }
}
