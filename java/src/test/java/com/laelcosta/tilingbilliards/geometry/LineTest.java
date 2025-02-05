package com.laelcosta.tilingbilliards.geometry;

import org.junit.jupiter.api.Test;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;
import static org.junit.jupiter.api.Assertions.*;

class LineTest {

    @Test
    void throughTwoPoints() {
        Line expected = new Line(1, 2, 2);
        Line actual = Line.throughTwoPoints(
                new Vector2D(2, 0),
                new Vector2D(0, 1)
        );
        assertEquals(expected.a, actual.a, EPSILON);
        assertEquals(expected.b, actual.b, EPSILON);
        assertEquals(expected.c, actual.c, EPSILON);
    }

    @Test
    void fromSrcDir() {
        Line expected = new Line(1, 2, 2);
        Line actual = Line.fromSrcDir(
                new Vector2D(2, 0),
                new Vector2D(-2, 1)
        );
        assertEquals(expected.a, actual.a, EPSILON);
        assertEquals(expected.b, actual.b, EPSILON);
        assertEquals(expected.c, actual.c, EPSILON);
    }

    @Test
    void intersect() {
        Line l1 = Line.throughTwoPoints(new Vector2D(0, 2), new Vector2D(2, 0));
        Line l2 = Line.throughTwoPoints(new Vector2D(0, 0), new Vector2D(2, 2));
        Vector2D intersection = l1.intersect(l2);
        assertEquals(0, new Vector2D(1, 1).distanceTo(intersection), EPSILON);
    }

    @Test
    void intersectParallel() {
        Line l1 = Line.throughTwoPoints(new Vector2D(0, 2), new Vector2D(2, 0));
        Line l2 = Line.throughTwoPoints(new Vector2D(0, 3), new Vector2D(2, 1));
        assertNull(l1.intersect(l2));
    }

    @Test
    void intersectSame() {
        Line l1 = Line.throughTwoPoints(new Vector2D(0, 2), new Vector2D(2, 0));
        Line l2 = Line.throughTwoPoints(new Vector2D(0, 2), new Vector2D(2, 0));
        assertNull(l1.intersect(l2));
    }

    @Test
    void contains() {
        Line l = Line.throughTwoPoints(new Vector2D(0, 1), new Vector2D(2, 3));
        assertTrue(l.contains(new Vector2D(4, 5)));
        assertFalse(l.contains(new Vector2D(1, 1)));
    }
}