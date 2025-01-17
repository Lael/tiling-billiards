package com.laelcosta.tilingbilliards.geometry;

/**
 * Represents an affine ray with a source and a direction.
 */
public class Ray {
    public Vector2D source;
    public Vector2D direction;

    public Ray(Vector2D source, Vector2D direction) {
        this.source = source;
        this.direction = direction.normalize();
    }

    @Override
    public String toString() {
        return "Ray{" +
                "source=" + source +
                ", direction=" + direction +
                '}';
    }
}
