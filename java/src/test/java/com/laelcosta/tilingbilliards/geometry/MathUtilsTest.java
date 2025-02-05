package com.laelcosta.tilingbilliards.geometry;

import org.junit.jupiter.api.Test;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.normalizeAngle;
import static java.lang.Math.PI;
import static org.junit.jupiter.api.Assertions.*;

class MathUtilsTest {

    @Test
    void testNormalizeAngle() {
        assertEquals(PI / 2, normalizeAngle(PI / 2));
        assertEquals( 5 * PI / 2, normalizeAngle(PI / 2, PI));
        assertEquals( -3 * PI / 2, normalizeAngle(PI / 2, -2*PI));
    }
}