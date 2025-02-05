package com.laelcosta.tilingbilliards.geometry;

public class PolygonRayCollision {
    public Vector2D point; // the point of collision
    public int side; // index of the side of the polygon we hit, which allows us to recover the normal direction

    public PolygonRayCollision(Vector2D point, int side) {
        this.point = point;
        this.side = side;
    }
}
