package com.laelcosta.tilingbilliards.geometry;

public class HyperGeodesic {
    private final HyperPoint start;
    private final HyperPoint end;
    private final HyperPoint idealStart;
    private final HyperPoint idealEnd;

    public HyperGeodesic(HyperPoint end, HyperPoint start) {
        if (start.equals(end)) throw new MathException("Degenerate HyperGeodesic");
        this.start = start;
        this.end = end;

        // Ideal points are those on the ``line at infinity,'' which for both Poincare and Klein models is the unit
        // circle. It is easier to find these in the Klein model, in which the geodesic projects to a straight line.
        Line l = Line.throughTwoPoints(start.getKlein(), end.getKlein());
        Vector2D[] idealPoints = l.intersect(new Circle(new Vector2D(), 1));
        if (idealPoints.length != 2) throw new MathException("Expected two intersections with ideal circle");
        double d0 = idealPoints[0].distanceToSq(start.getKlein());
        double d1 = idealPoints[1].distanceToSq(end.getKlein());
        if (d0 < d1) {
            idealStart = HyperPoint.fromKlein(idealPoints[0]);
            idealEnd = HyperPoint.fromKlein(idealPoints[1]);
        } else {
            idealStart = HyperPoint.fromKlein(idealPoints[1]);
            idealEnd = HyperPoint.fromKlein(idealPoints[0]);
        }
    }

    /**
     * Compute the hyperbolic distance between the start and end points. The Klein model is tidier.
     * @return the length of the geodesic
     */
    public double length() {
        double xq = this.idealStart.getKlein().distanceTo(this.end.getKlein());
        double py = this.start.getKlein().distanceTo(this.idealEnd.getKlein());
        double xp = this.idealStart.getKlein().distanceTo(this.start.getKlein());
        double qy = this.end.getKlein().distanceTo(this.idealEnd.getKlein());
        return 0.5 * Math.log(xq * py / (xp * qy));
    }
}
