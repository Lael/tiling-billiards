package com.laelcosta.tilingbilliards.tiling;

import com.laelcosta.tilingbilliards.DrawController;
import com.laelcosta.tilingbilliards.geometry.*;
import javafx.scene.paint.Color;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.laelcosta.tilingbilliards.geometry.MathUtils.EPSILON;

/**
 * Represents an edge tiling by a finite number of polygons.
 */
public abstract class PolygonalTiling {
    // The prototiles used in the tiling (typically a pretty short list)
    final Polygon[] tileset;
    // The tiles (may become quite large if a wide patch is drawn)
    Set<Tile> tiles = new HashSet<>();
    // Depending on how we generate tiles, it may happen that we try to add the same tile more than once. To avoid
    // duplicating tiles (and wasting memory), we can keep track of a `String` ID for each tile. This is not a perfect
    // solution, but seems to do the job.
    Set<String> tileIDs = new HashSet<>();

    // Color and width of the tile edges
    Color stroke = Color.WHITE;
    double lineWidth = 1;

    // Tiling billiards
    List<Vector2D> trajectory = new ArrayList<>();

    public PolygonalTiling(Polygon... tileset) {
        this.tileset = tileset;
    }

    // Generate all tiles within the given radius
    public void generate(double steps) {
        Set<String> generated = new HashSet<>();
        Set<Tile> current = new HashSet<>();
        Tile ft = firstTile();
        current.add(ft);
        generated.add(ft.id());
        this.addTile(ft);

        // We add tiles one concentric ring at a time. Starting with the first "ring", which is only the first tile, we
        // loop, and at each step, we add to the frontier all those tiles that are neighbors of the current ring which
        // have not already been generated. If we don't make this check, this operation will take exponential time, even
        // though the number of tiles should only grow like steps^2.
        for (int i = 0; i < steps; i++) {
            Set<Tile> frontier = new HashSet<>();
            for (Tile t : current) {
                for (int side = 0; side < tileset[t.tilesetIndex].n; side++) {
                    Tile a = adjacentTile(t, side);
                    String id = a.id();
                    if (!generated.contains(id)) frontier.add(a);
                    generated.add(id);
                    this.addTile(a);
                }
            }
            current = frontier;
        }
    }

    /**
     * It is very reasonable to override this.
     * @return the tile should be at the origin.
     */
    Tile firstTile() {
        return new Tile(0, new Vector2D(0, 0), 0);
    }

    /**
     * This is where the bulk of the implementation of a polygonal tiling lives. Given a tile and one of its sides,
     * generate or fetch the neighboring tile which shares that side. Together with a single starting tile, this is
     * enough to grow an arbitrarily large patch of the tiling.
     * @param t the current tile
     * @param side the side index
     * @return the neighboring tile
     */
    abstract Tile adjacentTile(Tile t, int side);

    /**
     * @param drawController some object that allows us to draw polygons wherever they belong
     */
    public void draw(DrawController drawController) {
        for (Tile tile : tiles) {
            Polygon p = tileset[tile.tilesetIndex].rotate(tile.rotation).translate(tile.position);
            drawController.drawPolygon(p, fillForPrototile(tile.tilesetIndex), stroke, lineWidth);
        }
        drawController.drawPath(trajectory, Color.WHITESMOKE, 1);
    }

    /**
     * Add a tile to the tiling if it hasn't already been added.
     * @param tile the tile
     */
    public void addTile(Tile tile) {
        String id = tile.id();
        if (tileIDs.contains(id)) return;
        tileIDs.add(id);
        tiles.add(tile);
    }

    /**
     * Currently, this method simply picks colors evenly spaced around the color wheel. There are lots of ways to make
     * this look nicer.
     * @param i the tileset index
     * @return the color
     */
    Color fillForPrototile(int i) {
        return Color.hsb((i / (double) tileset.length * 360 + 20) % 360, 0.5, 0.5);
    }

    /**
     * Play the game of
     * @param start a position in the plane
     * @param heading a heading (in radians)
     * @param iterations the number of steps to compute
     */
    public void tilingBilliard(Vector2D start, double heading, int iterations) {
        trajectory = new ArrayList<>();
        trajectory.add(start);
        Ray ray = new Ray(start, Vector2D.polar(1, heading));
        Tile tile = findTileContaining(start);
        if (tile == null) return;
        for (int i = 0; i < iterations; i++) {
            Polygon p = tileset[tile.tilesetIndex].rotate(tile.rotation).translate(tile.position);
            PolygonRayCollision collision = p.castRay(ray);
            if (collision == null) break;
            trajectory.add(collision.point);

            // Stop playing if we hit a vertex of the tiling: the map is ill-defined at such points.
            for (Vector2D v : p.vertices) {
                if (collision.point.distanceToSq(v) < EPSILON) {
                    break;
                }
            }

            // This is where the geometric details are implemented. One could perhaps expand on this for some kinds of
            // tilings. In quasi-regular tilings, it's clear what to do, but for a tiling in which multiple copies of
            // the same prototile share edges, two reasonable options suggest themselves:
            //     (1) Do exactly the same thing (i.e., every time you cross an edge, reflect the ray direction in the
            //         line normal to the edge).
            //     (2) Assign each prototile a (possibly negative) refractive index, and compute the new direction using
            //         Snell's Law. This would mean that the ray would proceed through same-tile edges unbent.
            Vector2D edge = p.vertices[(collision.side + 1) % p.n].minus(p.vertices[collision.side]);
            Vector2D reflected = ray.direction.minus(ray.direction.projectOnto(edge).times(2)).normalize();
            // It is helpful for numerical reasons to push the new ray source a little ways into the new tile. This has
            // a minute chance of causing errors close to vertices, but *shrug*.
            ray = new Ray(collision.point.plus(reflected.times(EPSILON)), reflected);
            tile = adjacentTile(tile, collision.side);
            addTile(tile);
        }
    }

    // If this becomes a performance bottleneck
    private Tile findTileContaining(Vector2D start) {
        for (Tile tile : this.tiles) {
            Polygon p = tileset[tile.tilesetIndex].rotate(tile.rotation).translate(tile.position);
            if (p.contains(start)) return tile;
        }
        return null;
    }

    public void printSizeInfo() {
        System.out.printf("Tiles: %d Tile Ids: %d\n", tiles.size(), tileIDs.size());
    }
}
