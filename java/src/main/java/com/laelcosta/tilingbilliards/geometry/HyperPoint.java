package com.laelcosta.tilingbilliards.geometry;

import java.util.Objects;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;

public class HyperPoint {
    private final Vector2D klein;
    private final Vector2D poincare;

    public HyperPoint(Vector2D klein, Vector2D poincare) {
        validateVector(klein);
        validateVector(poincare);
        this.klein = klein;
        this.poincare = poincare;
    }

    public Vector2D getKlein() {
        return klein;
    }

    public Vector2D getPoincare() {
        return poincare;
    }

    public double distanceTo(HyperPoint other) {
        return new HyperGeodesic(this, other).length();
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        HyperPoint that = (HyperPoint) o;
        return that.poincare.distanceTo(this.poincare) < EPSILON * EPSILON;
    }

    @Override
    public int hashCode() {
        return Objects.hash(klein, poincare);
    }

    static HyperPoint fromKlein(Vector2D klein) {
        return new HyperPoint(klein, kleinToPoincare(klein));
    }

    static HyperPoint fromPoincare(Vector2D poincare) {
        return new HyperPoint(poincareToKlein(poincare), poincare);
    }

    static Vector2D kleinToPoincare(Vector2D klein) {
        validateVector(klein);
        return klein.times(1 / (1 + Math.sqrt(Math.max(1 - klein.lengthSq(), 0))));
    }

    static Vector2D poincareToKlein(Vector2D poincare) {
        validateVector(poincare);
        return poincare.times(2 / (1 + poincare.lengthSq()));
    }

    private static void validateVector(Vector2D v) {
        if (v.lengthSq() > 1 + EPSILON) throw new MathException("Point outside unit disk");
    }
}
