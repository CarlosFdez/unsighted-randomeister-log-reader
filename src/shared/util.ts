/** Simple set difference, here until typescript/electron catches up */
export function difference<T>(set: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of set) {
        if (!other.has(item)) {
            result.add(item);
        }
    }
    return result;
}

/** Returns true if set is a subset of other, here until typescript/electron catches up */
export function isSupersetOf<T>(set: Set<T>, other: Set<T>): boolean {
    if (set.size < other.size) return false;
    return [...other].every((i) => set.has(i));
}

export function isSetEqual<T>(set: Set<T>, other: Set<T>): boolean {
    return set.size === other.size && [...set].every((s) => other.has(s));
}
