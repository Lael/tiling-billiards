package com.laelcosta.tilingbilliards.tiling;

import com.laelcosta.tilingbilliards.geometry.Polygon;
import com.laelcosta.tilingbilliards.geometry.Vector2D;

/**
 * Tilings with two regular polygons, meeting in the pattern [n, m, n, m].
 */
public class QuasiRegularTiling extends PolygonalTiling {
    private final double centerToCenter;

    public QuasiRegularTiling(int n, int m) {
        super(Polygon.regular(n, 1), Polygon.regular(m, 1));
        centerToCenter = 0.5 / Math.tan(Math.PI / n) + 0.5 / Math.tan(Math.PI / m);
    }

    @Override
    Tile adjacentTile(Tile t, int side) {
        double theta = t.rotation + (side + 0.5) * 2 * Math.PI / tileset[t.tilesetIndex].n;
        int index = (t.tilesetIndex + 1) % 2;
        // every edge has an n-gon on one side and an m-gon on the other, so we simply toggle the tileset index
        return new Tile(index,
                t.position.plus(Vector2D.polar(centerToCenter, theta)),
                theta + Math.PI * (1 - 1.0/tileset[index].n)
                );
    }
}
