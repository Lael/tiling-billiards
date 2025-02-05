package com.laelcosta.tilingbilliards.geometry;

public class LineSegment {
    private final Line line;
    public final Vector2D p1, p2;
    private double length = -1;
    private double lengthSq = -1;

    public LineSegment(Vector2D p1, Vector2D p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.line = Line.throughTwoPoints(p1, p2);
    }

    public Vector2D intersect(LineSegment other) {
        Vector2D candidate = this.line.intersect(other.line);
        if (candidate == null) return null;
        return (this.contains(candidate) && other.contains(candidate)) ? candidate : null;
    }

    public Vector2D intersect(Line other) {
        Vector2D candidate = this.line.intersect(other);
        if (candidate == null) return null;
        return this.contains(candidate) ? candidate : null;
    }

    public boolean contains(Vector2D point) {
        return this.line.contains(point) &&
                point.distanceToSq(p1) <= this.lengthSq() &&
                point.distanceToSq(p2) <= this.lengthSq();
    }

    public double length() {
        if (length < 0) length = p2.minus(p1).length();
        return length;
    }

    public double lengthSq() {
        if (lengthSq < 0) lengthSq = p2.minus(p1).lengthSq();
        return lengthSq;
    }
}
