package com.laelcosta.tilingbilliards.geometry;

import java.util.Objects;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;

/**
 * Vector2D represents a point or a vector in a 2D affine space. There are many implementations out there, but I like
 * writing my own so that I know exactly what every operation does. The key point here is that every arithmetic
 * operation creates a new instance. This is inefficient, but prevents a nasty type of bug where data changes under your
 * feet when you pass objects around.
 */
public class Vector2D {
    public double x;
    public double y;

    public Vector2D(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Vector2D() {
        this(0, 0);
    }

    public static Vector2D polar(double r, double theta) {
        return new Vector2D(Math.cos(theta) * r, Math.sin(theta) * r);
    }

    public Vector2D plus(Vector2D other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    public Vector2D minus(Vector2D other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    public Vector2D times(double d) {
        return new Vector2D(this.x * d, this.y * d);
    }

    public double length() {
        return Math.sqrt(this.lengthSq());
    }

    public double lengthSq() {
        return this.dot(this);
    }

    double distanceTo(Vector2D other) {
        return this.minus(other).length();
    }

    public double distanceToSq(Vector2D other) {
        return this.minus(other).lengthSq();
    }

    Vector2D rotate(double theta) {
        double c = Math.cos(theta);
        double s = Math.sin(theta);
        return new Vector2D(
                c * x - s * y,
                s * x + c * y
        );
    }

    public Vector2D normalize() {
        return this.normalize(1.0);
    }

    public Vector2D normalize(double l) {
        return this.times(l / length());
    }

    public double dot(Vector2D other) {
        return x * other.x + y * other.y;
    }

    public Vector2D projectOnto(Vector2D other) {
        return other.times(this.dot(other) / other.dot(other));
    }

    public double headingTo(Vector2D other) {
        return other.minus(this).heading();
    }

    public double heading() {
        return Math.atan2(y, x);
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Vector2D vector2D = (Vector2D) o;
        return (Double.compare(x, vector2D.x) == 0 && Double.compare(y, vector2D.y) == 0)
                || this.distanceTo(vector2D) < EPSILON;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "{" + x + ", " + y + "}";
    }
}
