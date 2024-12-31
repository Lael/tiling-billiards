package com.laelcosta.tilingbilliards.geometry;

public class Circle {
    private final Vector2D center;
    private final double radius;

    public Circle(Vector2D center, double radius) {
        if (radius <= 0) throw new MathException("Negative radius");
        this.center = center;
        this.radius = radius;
    }

    public Vector2D getCenter() {
        return center;
    }

    public double getRadius() {
        return radius;
    }
}
