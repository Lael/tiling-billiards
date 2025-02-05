package com.laelcosta.tilingbilliards.geometry;

public class Line {
    // ax + by = c
    final double a, b, c;

    public Line(double a, double b, double c) {
        if (a == 0 && b == 0) throw new MathException("Degenerate line 0x + 0y = c");
        double l = Math.sqrt(a * a + b * b);
        if (a < 0 || (a == 0 && b < 0)) {
            l *= -1;
        }

        this.a = a / l;
        this.b = b / l;
        this.c = c / l;
    }

    public static Line throughTwoPoints(Vector2D p1, Vector2D p2) {
        if (p1.equals(p2)) throw new MathException("Degenerate line through point and itself");
        Vector2D normal = p1.minus(p2).normalize().rotate(Math.PI / 2);
        return new Line(normal.x, normal.y, normal.dot(p1));
    }

    public static Line fromSrcDir(Vector2D src, Vector2D dir) {
        if (dir.lengthSq() == 0) throw new MathException("Degenerate line with no direction");
        Vector2D normal = dir.normalize().rotate(Math.PI / 2);
        return new Line(normal.x, normal.y, normal.dot(src));
    }

    /**
     * Intersect two lines using the inverse of the matrix formulation of the system of two linear equations. This
     * method returns null if there is not a unique intersection. TODO(lael): do the right thing- throw Exceptions.
     * @param other the other line
     * @return the point of intersection, or null if there is not a unique one.
     */
    public Vector2D intersect(Line other) {
        // a1x + b1y = c1
        // a2x + b2y = c2
        // [a1 b1][x] = [c1]
        // [a2 b2][y] = [c2]
        double d = this.a * other.b - this.b * other.a;
        if (d == 0) return null;
        // [x] = 1/d [b2  -b1][c1]
        // [y]       [-a2  a1][c2]
        return new Vector2D(
                (other.b * this.c - this.b * other.c) / d,
                (-other.a * this.c + this.a * other.c) / d
        );
    }

    public boolean contains(Vector2D point) {
        double dist = this.a * point.x + this.b * point.y - this.c;
        return Math.abs(dist) <= MathUtils.EPSILON;
    }
}
