import {Complex} from "./complex";
import {Vector2} from "three";

export function normalizeAngle(theta: number, low: number = -Math.PI) {
    if (!isFinite(theta)) throw Error('Cannot normalize non-finite number');
    while (theta < low) theta += 2 * Math.PI;
    while (theta >= low + 2 * Math.PI) theta -= 2 * Math.PI;
    return theta;
}

export function closeEnough(r1: number, r2: number) {
    if (!isFinite(r1) || !isFinite(r2)) return false;
    return Math.abs(r1 - r2) < EPSILON;
}

export function solveQuadratic(a: Complex, b: Complex, c: Complex): Complex[] {
    const d = b.times(b).minus(a.times(c).scale(4)).sqrt();
    if (d.isZero()) return [b.scale(-0.5).over(a)];
    return [b.scale(-1).minus(d).over(a.scale(2)), b.scale(-1).plus(d).over(a.scale(2))];
}

export function includedAngle(p1: Vector2, p2: Vector2, p3: Vector2) {
    let d1 = p1.clone().sub(p2);
    let d2 = p3.clone().sub(p2);
    return Math.acos(d1.dot(d2) / (d1.length() * d2.length()));
}

export const EPSILON = 1e-12;
