module com.laelcosta.tilingbilliards {
    requires javafx.controls;
    requires javafx.fxml;

    requires org.controlsfx.controls;
	requires javafx.graphics;
    requires java.desktop;

    opens com.laelcosta.tilingbilliards to javafx.fxml;
    exports com.laelcosta.tilingbilliards;
    exports com.laelcosta.tilingbilliards.geometry;
}