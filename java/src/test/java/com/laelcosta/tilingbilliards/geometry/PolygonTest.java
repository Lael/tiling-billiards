package com.laelcosta.tilingbilliards.geometry;

import org.junit.jupiter.api.Test;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;
import static java.lang.Math.PI;
import static org.junit.jupiter.api.Assertions.*;

class PolygonTest {

    private static final Polygon NON_CONVEX = new Polygon(
                new Vector2D(0, 0),
                new Vector2D(1, 0),
                new Vector2D(1, 2),
                new Vector2D(3, 2),
                new Vector2D(3, 0),
                new Vector2D(4, 0),
                new Vector2D(4, 3),
                new Vector2D(0, 3)
        );

    @Test
    void regular() {
        int n = 4;
        double s = 3;
        Polygon p = Polygon.regular(n, s);
        for (int i = 0; i < n; i++) {
            assertEquals(s, p.vertices[i].distanceTo(p.vertices[(i+1)%n]), EPSILON);
            assertEquals(p.vertices[i].lengthSq(), p.vertices[(i+1)%n].lengthSq(), EPSILON);
        }
    }

    @Test
    void containsConvex() {
        Polygon p = new Polygon(
                new Vector2D(0, 0),
                new Vector2D(1, 0),
                new Vector2D(0, 1)
        );
        assertTrue(p.contains(new Vector2D(0, 0)));
        assertTrue(p.contains(new Vector2D(0.25, 0.25)));
        assertFalse(p.contains(new Vector2D(0.75, 0.75)));
    }

    @Test
    void containsNonConvex() {
        assertTrue(NON_CONVEX.contains(new Vector2D(0, 0)));
        assertTrue(NON_CONVEX.contains(new Vector2D(0.25, 0.25)));
        assertFalse(NON_CONVEX.contains(new Vector2D(2, 1))); // Contained in convex hull but not in polygon
    }


    @Test
    void castRay() {
        Polygon p = new Polygon(
                new Vector2D(-1, -1),
                new Vector2D(1, -1),
                new Vector2D(1, 1),
                new Vector2D(-1, 1)
        );
        PolygonRayCollision c = p.castRay(new Ray(new Vector2D(0.5, 0.5), new Vector2D(0, -1)));
        assertNotNull(c);
        assertEquals(0, c.side);
        assertEquals(0, c.point.distanceTo(new Vector2D(0.5, -1)), EPSILON);
    }

    @Test
    void castRayNonConvex() {
        PolygonRayCollision c = NON_CONVEX.castRay(new Ray(new Vector2D(0.5, 0.5), new Vector2D(1,0)));
        assertNotNull(c);
        assertEquals(0, c.point.distanceTo(new Vector2D(1, 0.5)), EPSILON);
    }

    @Test
    void castRayOutside() {
        PolygonRayCollision c = NON_CONVEX.castRay(new Ray(new Vector2D(2, 1), new Vector2D(0, 1)));
        assertNull(c);
    }

    @Test
    void castRayVertex() {
        Polygon p = new Polygon(
                new Vector2D(-1, -1),
                new Vector2D(1, -1),
                new Vector2D(1, 1),
                new Vector2D(-1, 1)
        );
        PolygonRayCollision c = p.castRay(new Ray(new Vector2D(), new Vector2D(1,1).normalize()));
        assertNull(c);
    }

    @Test
    void rotate() {
        Polygon p = new Polygon(
                new Vector2D(0, 0),
                new Vector2D(1, 0),
                new Vector2D(0, 1)
        );
        Polygon expected = new Polygon(
                new Vector2D(0, 0),
                new Vector2D(0, 1),
                new Vector2D(-1, 0)
        );
        Polygon actual = p.rotate(PI / 2);
        for (int i = 0; i < p.n; i++) {
            assertTrue(expected.vertices[i].distanceTo(actual.vertices[i]) <= EPSILON);
        }
    }

    @Test
    void translate() {
        Polygon p = new Polygon(
                new Vector2D(0, 0),
                new Vector2D(1, 0),
                new Vector2D(0, 1)
        );
        Polygon expected = new Polygon(
                new Vector2D(1, 0),
                new Vector2D(2, 0),
                new Vector2D(1, 1)
        );
        Polygon actual = p.translate(new Vector2D(1, 0));
        for (int i = 0; i < p.n; i++) {
            assertTrue(expected.vertices[i].distanceTo(actual.vertices[i]) <= EPSILON);
        }
    }
}