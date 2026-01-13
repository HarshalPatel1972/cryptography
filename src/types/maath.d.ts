declare module 'maath/random/dist/maath-random.esm' {
    export function inSphere(buffer: Float32Array, options?: { radius?: number; center?: number[] }): Float32Array;
    export function inBox(buffer: Float32Array, options?: { sides?: number[]; center?: number[] }): Float32Array;
    // Add other functions if needed, but inSphere is the critical one used
}
