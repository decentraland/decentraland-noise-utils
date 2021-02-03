/// <reference types="env" />
/// <reference types="dcl" />
export declare class Noise {
    static grad3: Grad[];
    static p: number[];
    static perm: Array<number>;
    static gradP: Array<Grad>;
    static F2: number;
    static G2: number;
    static F3: number;
    static G3: number;
    static initialized: boolean;
    static Init(seed?: number): void;
    static seed(seed: number): void;
    static simplex2(xin: number, yin: number): number;
    static simplex3(xin: number, yin: number, zin: number): number;
    static fade(t: number): number;
    static lerp(a: number, b: number, t: number): number;
    static perlin2(x: number, y: number): number;
    static perlin3(x: number, y: number, z: number): number;
}
export declare class Grad {
    vector: Vector3;
    constructor(x: number, y: number, z: number);
    dot2(x: number, y: number): number;
    dot3(x: number, y: number, z: number): number;
}
