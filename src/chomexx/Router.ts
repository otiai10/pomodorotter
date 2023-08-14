
type ResolvedInfo<U = void> = {
    name: string;
} & U;

type ResolvedPayload<T> = T & {
    route: ResolvedInfo;
}

export class Router<T, U = {} | void> {

    public routes: { [name: string]: (payload: T | ResolvedPayload<T>) => (void | Promise<any>) } = {};

    constructor(public resolver: (payload: T) => Promise<ResolvedInfo<U>>) { }

    public on(name: string, callback: (payload: T | ResolvedPayload<T>) => (void | Promise<any>)) {
        this.routes[name] = callback;
    }

    public listener() {
        return async (payload: T) => {
            const resolved = await this.resolver(payload);
            if (resolved.name in this.routes) {
                return await this.routes[resolved.name]({ ...payload, route: resolved });
            }
        }
    }

}