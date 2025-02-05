package com.laelcosta.tilingbilliards.tiling;

import com.laelcosta.tilingbilliards.geometry.Vector2D;

import java.util.Objects;

/**
 * A Tile instance represents an individual tile in a tiling. It encodes its translation and rotation, but does not
 * store the geometry of the prototile of which it is a copy. Instead, it uses the `tilesetIndex` field to point to an
 * entry in the parent tiling. This saves potentially quite a bit of memory.
 */
public class Tile {
    public int tilesetIndex;
    public Vector2D position;
    public double rotation;

    public Tile(int tilesetIndex, Vector2D position, double rotation) {
        this.tilesetIndex = tilesetIndex;
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * This id encodes the tilesetIndex and a coarse stringification of the position. This should help prevent
     * duplicating tiles: if two tiles have the same id, then unless we've made some other mistake, we only need one of
     * them.
     * @return the ID
     */
    public String id() {
        return String.format("%d,%05f,%05f", tilesetIndex, position.x, position.y);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tilesetIndex, position, rotation);
    }

    @Override
    public String toString() {
        return "Tile{" +
                "tilesetIndex=" + tilesetIndex +
                ", position=" + position +
                ", rotation=" + rotation +
                '}';
    }
}
