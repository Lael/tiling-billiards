package com.laelcosta.tilingbilliards.geometry;

import java.util.Arrays;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;
import static com.laelcosta.tilingbilliards.geometry.MathUtils.normalizeAngle;

/**
 * Represents a Euclidean polygon. Assumes right-handed orientation (vertices are arranged anti-clockwise).
 * Polygons need not be convex, but they are assumed to be non-self-intersecting.
 */
public class Polygon {
    public final int n;
    public Vector2D[] vertices;

    public Polygon(Vector2D... vertices) {
        this.vertices = vertices;
        n = vertices.length;
    }

    /**
     * Creates a regular polygon with a given side length.
     * @param n the number of vertices
     * @param side how long the sides should be
     * @return the polygon
     */
    public static Polygon regular(int n, double side) {
        double circumRadius = 0.5 * side / Math.sin(Math.PI / n);
        Vector2D[] vertices = new Vector2D[n];
        double theta = 2.0 * Math.PI / n;
        for (int i = 0; i < n; i++) {
            vertices[i] = Vector2D.polar(circumRadius, i * theta);
        }
        return new Polygon(vertices);
    }

    /**
     * The classic containment test: if a polygon contains a point, then an observer at the test point should turn their
     * head exactly once to follow another person traversing the polygon's vertices in order.
     * @param point the point to check
     * @return true if point is contained in this polygon
     */
    public boolean contains(Vector2D point) {
        // Winding number accumulator
        double wn = 0;
        for (int i = 0; i < n; i++) {
            Vector2D v1 = vertices[i];
            Vector2D v2 = vertices[(i + 1) % n];
            if (new LineSegment(v1, v2).contains(point)) return true;
            wn += normalizeAngle(point.headingTo(v2) - point.headingTo(v1));
        }
        return wn > Math.PI;
    }

    /**
     * This is the important part for billiard-type systems. To ``cast a ray'' means to move an imaginary particle along
     * the ray until it collides with something. In this case, that means hitting a side of the polygon. For non-convex
     * polygons, multiple collisions are possible, so we return the first one. Return null if the ray source is not
     * contained in the polygon or if the collision is extremely close to a vertex.
     * @param ray the ray to cast
     * @return an object reflecting useful information about the collision, or null
     */
    public PolygonRayCollision castRay(Ray ray) {
        if (!this.contains(ray.source)) {
            // Polygon does not contain ray source for some reason. In practice, this likely means that the previous
            // collision was very close to a corner, so the step forward by epsilon hops over the polygon.
            return null;
        }
        Line rayLine = Line.fromSrcDir(ray.source, ray.direction);
        double bestT = Double.POSITIVE_INFINITY;
        PolygonRayCollision bestIntersection = null;

        for (int i = 0; i < vertices.length; i++) {
            // loop over the sides of the polygon
            Vector2D v1 = vertices[i];
            Vector2D v2 = vertices[(i + 1) % n];
            LineSegment side = new LineSegment(v1, v2);
            Vector2D intersection = side.intersect(rayLine);
            if (intersection == null) {
                continue;
            }

            // t as in r(t) = P + tV. This is essentially the (signed) distance from the source to the collision
            double t = intersection.minus(ray.source).dot(ray.direction);
            if (t < 0) {
                // negative t means the collision is behind the start point
                continue;
            }
            if (t < bestT) {
                // this collision is closer than the previous closest
                bestT = t;
                bestIntersection = new PolygonRayCollision(intersection, i);
            }
        }
        if (bestIntersection == null) return bestIntersection;
        for (Vector2D v : vertices) {
            if (bestIntersection.point.distanceTo(v) < EPSILON) {
                return null;
            }
        }
        return bestIntersection;
    }

    public Polygon rotate(double theta) {
        Vector2D[] rotatedVertices = new Vector2D[n];
        for (int i = 0; i < n; i++) rotatedVertices[i] = vertices[i].rotate(theta);
        return new Polygon(rotatedVertices);
    }

    public Polygon translate(Vector2D translation) {
        Vector2D[] translatedVertices = new Vector2D[n];
        for (int i = 0; i < n; i++) translatedVertices[i] = vertices[i].plus(translation);
        return new Polygon(translatedVertices);
    }

    @Override
    public String toString() {
        return "Polygon{" +
                "n=" + n +
                ", vertices=" + Arrays.toString(vertices) +
                '}';
    }
}
