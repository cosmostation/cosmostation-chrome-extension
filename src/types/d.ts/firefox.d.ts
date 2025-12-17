declare function cloneInto<T>(obj: T, target: Window): T;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
declare function exportFunction<T extends Function>(func: T, target: Window): T;
