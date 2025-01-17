package com.laelcosta.tilingbilliards;

import com.laelcosta.tilingbilliards.geometry.Polygon;
import com.laelcosta.tilingbilliards.geometry.Vector2D;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;

import java.util.List;

/**
 * This is a wrapper around the Canvas/GraphicsContext API. In particular, this allows us to pan and zoom around the
 * world without having to tell every object about the position of the virtual camera. There is probably a different
 * (better?) way of obtaining this functionality using JavaFX builtins, but this works well enough for now.
 */
public class DrawController {
    private final Canvas canvas;
    private final GraphicsContext graphicsContext;
    private final Vector2D center;
    private double zoom; // pixels per unit of world space

    public DrawController(Canvas canvas) {
        this.canvas = canvas;
        this.graphicsContext = canvas.getGraphicsContext2D();
        this.center = new Vector2D(0, 0);
        this.zoom = 100;
    }

    public void setCenter(double x, double y) {
        this.center.x = x;
        this.center.y = y;
    }

    public void translate(double x, double y) {
        this.center.x -= x;
        this.center.y -= y;
    }

    public void setZoom(double zoom) {
        this.zoom = zoom;
    }

    public void clear() {
        graphicsContext.setFill(Color.BLACK);
        graphicsContext.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
    }

    /**
     * Draw a polygon to the screen.
     * @param polygon the polygon to be drawn
     * @param fill the color to paint the interior of the polygon or null
     * @param stroke the color to paint the border of the polygon or null
     */
    public void drawPolygon(Polygon polygon, Color fill, Color stroke, double linewidth) {
        if (fill == null && stroke == null) return;
        int n = polygon.n;
        double[] xs = new double[n];
        double[] ys = new double[n];

        for (int i = 0; i < n; i++) {
            xs[i] = (polygon.vertices[i].x - center.x) * zoom + canvas.getWidth() / 2.0;
            ys[i] = (polygon.vertices[i].y - center.y) * zoom + canvas.getHeight() / 2.0;
        }

        if (fill != null) {
            this.graphicsContext.setFill(fill);
            this.graphicsContext.fillPolygon(xs, ys, n);
        }

        if (stroke != null) {
            this.graphicsContext.setStroke(stroke);
            this.graphicsContext.setLineWidth(linewidth);
            this.graphicsContext.strokePolygon(xs, ys, n);
        }
    }

    public Vector2D getCenter() {
        return new Vector2D(center.x, center.y);
    }

    public double getZoom() {
        return zoom;
    }

    public void drawPath(List<Vector2D> path, Color stroke, double linewidth) {
        graphicsContext.setStroke(stroke);
        graphicsContext.setLineWidth(linewidth);
        int n = path.size();
        double[] xs = new double[n];
        double[] ys = new double[n];

        for (int i = 0; i < n; i++) {
            xs[i] = (path.get(i).x - center.x) * zoom + canvas.getWidth() / 2.0;
            ys[i] = (path.get(i).y - center.y) * zoom + canvas.getHeight() / 2.0;
        }
        graphicsContext.strokePolyline(xs, ys, n);
    }
}
