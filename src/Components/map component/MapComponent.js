import { useEffect, useState } from "react";
import styles from "./MapComponent.module.css";
import { Map, View } from "ol";
import { Tile } from "ol/layer.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import Geolocation from "ol/Geolocation";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Circle from "ol/geom/Circle";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import XYZ from "ol/source/XYZ";

const MapComponent = (props) => {
  const [pin, setPin] = useState([0, 0]);
  const [accuracyCircle, setAccuracyCircle] = useState(null);

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const locationLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "blue" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });

    const accuracyLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({ color: "rgba(0, 0, 255, 0.2)" }),
      }),
    });

    const map = new Map({
      target: "map",
      layers: [osmLayer, locationLayer, accuracyLayer],
      view: new View({
        center: [0, 0],
        zoom: 8,
        maxZoom: 15,
        minZoom: 8,
      }),
    });

    map.on("click", (event) => {
      const clickedCoordinate = event.coordinate;
      setPin(clickedCoordinate);
      // console.log("Clicked Coordinate:", clickedCoordinate);
    });

    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: map.getView().getProjection(),
    });

    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();
      const accuracy = geolocation.getAccuracy();

      // Update location point
      const locationPoint = new Feature({
        geometry: new Point(coordinates),
      });
      locationLayer.getSource().clear();
      locationLayer.getSource().addFeature(locationPoint);

      // Update accuracy circle
      const accuracyGeom = new Circle(coordinates, accuracy);
      const accuracyFeature = new Feature({
        geometry: accuracyGeom,
      });
      accuracyLayer.getSource().clear();
      accuracyLayer.getSource().addFeature(accuracyFeature);

      // Zoom to accuracy circle
      map.getView().fit(accuracyGeom, { padding: [20, 20, 20, 20] });

      // console.log("Current location:", coordinates);
    });

    geolocation.setTracking(true);

    return () => map.setTarget(null);
  }, []);

  return (
    <div
      //   style={{ height: "300px", width: "100%" }}
      className={styles.mapcomp}
      id="map"
    ></div>
  );
};
export default MapComponent;
