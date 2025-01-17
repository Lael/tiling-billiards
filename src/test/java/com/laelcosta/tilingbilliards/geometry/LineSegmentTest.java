package com.laelcosta.tilingbilliards.geometry;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LineSegmentTest {

    @Test
    void intersectLine() {
        Line l = Line.throughTwoPoints(new Vector2D(0, 0), new Vector2D(1, 1));
        LineSegment ls1 = new LineSegment(new Vector2D(-1, 1), new Vector2D(1, -1));
        LineSegment ls2 = new LineSegment(new Vector2D(0, 1), new Vector2D(-1, 2));
        assertEquals(new Vector2D(), ls1.intersect(l));
        assertNull(ls2.intersect(l));
    }

    @Test
    void intersectLineSegment() {
        LineSegment ls1 = new LineSegment(new Vector2D(0, 0), new Vector2D(1, 1));
        LineSegment ls2 = new LineSegment(new Vector2D(0, 1), new Vector2D(1, 0));
        LineSegment ls3 = new LineSegment(new Vector2D(1, 2), new Vector2D(2, 1));
        Vector2D v = ls1.intersect(ls2);
        assertEquals(new Vector2D(0.5, 0.5), v);
        assertNull(ls1.intersect(ls3));
    }

    @Test
    void contains() {
        LineSegment ls = new LineSegment(new Vector2D(0, 0), new Vector2D(1, 1));
        assertTrue(ls.contains(new Vector2D(0.5, 0.5)));
        assertTrue(ls.contains(new Vector2D(0, 0)));
        assertFalse(ls.contains(new Vector2D(-0.01, -0.01)));
        assertFalse(ls.contains(new Vector2D(0.01, 0.02)));
    }
}