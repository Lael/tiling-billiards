package com.laelcosta.tilingbilliards.geometry;

import org.junit.jupiter.api.Test;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;
import static org.junit.jupiter.api.Assertions.*;

class Vector2DTest {

    @Test
    void polar() {
        Vector2D expected = new Vector2D(sqrt(2), sqrt(2));
        Vector2D actual = Vector2D.polar(2, PI / 4);
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void plus() {
        Vector2D expected = new Vector2D(2, 3);
        Vector2D actual = new Vector2D(1, 2).plus(new Vector2D(1, 1));
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void minus() {
        Vector2D expected = new Vector2D(0, 1);
        Vector2D actual = new Vector2D(1, 2).minus(new Vector2D(1, 1));
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void times() {
        Vector2D expected = new Vector2D(1.5, 3);
        Vector2D actual = new Vector2D(1, 2).times(1.5);
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void length() {
        assertEquals(5, new Vector2D(3, 4).length());
    }

    @Test
    void lengthSq() {
        assertEquals(25, new Vector2D(3, 4).lengthSq());
    }

    @Test
    void distanceTo() {
        assertEquals(5, new Vector2D(3, 4).distanceTo(new Vector2D(6, 8)));
    }

    @Test
    void distanceToSq() {
        assertEquals(25, new Vector2D(3, 4).distanceToSq(new Vector2D(6, 8)));
    }

    @Test
    void rotate() {
        Vector2D expected = new Vector2D(0,2);
        Vector2D actual = new Vector2D(sqrt(2), sqrt(2)).rotate(PI / 4);
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void normalize() {
        double s5 = sqrt(5);
        Vector2D expected = new Vector2D(1 / s5, 2 / s5);
        Vector2D actual = new Vector2D(1, 2).normalize();
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void dot() {
        double expected = 12;
        double actual = new Vector2D(2, 6).dot(new Vector2D(3, 1));
        assertEquals(expected, actual);
    }

    @Test
    void projectOnto() {
        Vector2D expected = new Vector2D(2, 2);
        Vector2D actual = new Vector2D(4, 0).projectOnto(new Vector2D(4, 4));
        assertEquals(expected.x, actual.x, EPSILON);
        assertEquals(expected.y, actual.y, EPSILON);
    }

    @Test
    void headingTo() {
        double expected = PI / 4;
        double actual = new Vector2D(1,  0).headingTo(new Vector2D(3, 2));
        assertEquals(expected, actual);
    }

    @Test
    void heading() {
        double expected = -PI / 4;
        double actual = new Vector2D(1,  -1).heading();
        assertEquals(expected, actual);
    }
}