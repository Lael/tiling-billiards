package com.laelcosta.tilingbilliards;

import com.laelcosta.tilingbilliards.geometry.Vector2D;
import com.laelcosta.tilingbilliards.tiling.PolygonalTiling;
import com.laelcosta.tilingbilliards.tiling.QuasiRegularTiling;
import javafx.animation.AnimationTimer;
import javafx.fxml.FXML;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.Slider;
import javafx.scene.input.MouseEvent;
import javafx.scene.input.ScrollEvent;

public class TilingBilliardsController {
    private final static double ZOOM_SPEED = 0.005;
    private final PolygonalTiling tiling = new QuasiRegularTiling(3,6);
    private long lastFrameTime = -1;

    double startX = 0;
    double startY = 0;

    double mouseX;
    double mouseY;

    @FXML
    private Slider slider;

    @FXML
    private Canvas canvas;

    private DrawController drawController;

    @FXML
    public void initialize() {
         drawController = new DrawController(canvas);
         tiling.generate(10);
         tiling.printSizeInfo();
         tiling.tilingBilliard(new Vector2D(startX, startY), -slider.getValue() * Math.PI, 100000);

         slider.valueProperty().addListener((_, _, newValue) -> {
             long startTime = System.nanoTime();
             tiling.tilingBilliard(new Vector2D(startX, startY), -newValue.doubleValue() * Math.PI, 100000);
             long endTime = System.nanoTime();
             double duration = ((double) (endTime - startTime)) / 1e6; // in ms
             if (duration > 100) System.out.printf("Slow computation: %.01fms\n", duration);
         });

         new AnimationTimer() {
             @Override public void handle(long currentNanoTime) {
                 if (lastFrameTime > 0) {
                     double frameTime = (double) (currentNanoTime - lastFrameTime) / 1e6; // in ms
                     if (frameTime > 100) { // 0.1s
                         System.out.printf("Long gap between frames: %.01fms\n", frameTime);
                         tiling.printSizeInfo();
                     }
                 }
                 lastFrameTime = currentNanoTime;
                 draw();
             }
         }.start();
    }

    @FXML
    protected void onCanvasDragStart(MouseEvent event) {
        mouseX = event.getX();
        mouseY = event.getY();
    }

    @FXML
    protected void onCanvasDrag(MouseEvent event) {
        long startTime = System.nanoTime();
        double x = event.getX();
        double y = event.getY();
        double z = drawController.getZoom();
        drawController.translate((x - mouseX) / z, (y - mouseY) / z);

        mouseX = x;
        mouseY = y;
        long endTime = System.nanoTime();
        double duration = ((double) (endTime - startTime)) / 1e3; // in µs
        if (duration > 5000) System.out.printf("Slow dragging: %.01fµs\n", duration);
    }

    @FXML
    protected void onCanvasScroll(ScrollEvent event) {
        long startTime = System.nanoTime();
        double x = event.getX();
        double y = event.getY();

        Vector2D v = drawController.getCenter();
        double z = drawController.getZoom();
        // translate v so that (x, y) is in the center
        v.x += (x - canvas.getWidth() / 2) / z;
        v.y += (y - canvas.getHeight() / 2) / z;

        z = drawController.getZoom() * Math.exp(event.getDeltaY() * ZOOM_SPEED);
        drawController.setZoom(z);

        v.x -= (x - canvas.getWidth() / 2) / z;
        v.y -= (y - canvas.getHeight() / 2) / z;

        drawController.setCenter(v.x, v.y);
        long endTime = System.nanoTime();
        double duration = ((double) (endTime - startTime)) / 1e3; // in µs
        if (duration > 5000) System.out.printf("Slow scrolling: %.01fµs\n", duration);
    }

    void draw() {
        long startTime = System.nanoTime();
        drawController.clear();
        tiling.draw(drawController);
        long endTime = System.nanoTime();

        double duration = ((double) (endTime - startTime)) / 1e3; // in µs

        if (duration > 5000) System.out.printf("Slow frame draw: %.01fµs\n", duration);
    }
}