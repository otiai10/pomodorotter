
export enum Type {
    Focus = 'focus',
    Relax = 'relax',
}

export enum EndState {
    Completed = 'completed',
    Interrupted = 'interrupted',
}

export class Timebox {
    public endstate: EndState | null = null;
    constructor(
        public type: Type,
        public start: number,
        public end: number,
    ) {}
    public static focus(minutes: number, start: number = Date.now()) {
        return new Timebox(Type.Focus, start, start + minutes * 60 * 1000);
    }
    public static relax(minutes: number, start: number = Date.now()) {
        return new Timebox(Type.Relax, start, start + minutes * 60 * 1000);
    }
    public interrupt() {
        this.endstate = EndState.Interrupted;
        return this;
    }
    public complete() {
        this.endstate = EndState.Completed;
        return this;
    }
}
