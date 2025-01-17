package com.laelcosta.tilingbilliards.geometry;

public class MathUtils {
    public static final double EPSILON = 1e-12;

    /**
     * Add or subtract 2π from a given angle so that it lies in the interval [lo, lo + 2π)
     * @param theta the angle
     * @param lo where to start the interval of length 2π
     * @return the normalized angle
     */
    public static double normalizeAngle(double theta, double lo) {
        if (!Double.isFinite(theta)) return theta;
        while (theta < lo) theta += 2 * Math.PI;
        while (theta >= lo + 2 * Math.PI) theta -= 2 * Math.PI;
        return theta;
    }

    public static double normalizeAngle(double theta) {
        return normalizeAngle(theta, -Math.PI);
    }
}
