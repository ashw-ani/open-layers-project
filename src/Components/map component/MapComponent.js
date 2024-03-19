import React, { useEffect, useRef } from "react";
import styles from "./MapComponent.module.css";
import { Map, View } from "ol";
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
import { Draw } from "ol/interaction";
import { fromLonLat } from "ol/proj";

const MapComponent = (props) => {
  const drawPointRef = useRef();
  const drawLineStringRef = useRef();
  const drawPolygonRef = useRef();

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const locationLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "blue" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });

    const pinpointSource = new VectorSource();
    const pinpointLayer = new VectorLayer({
      source: pinpointSource,
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });

    const drawingSource = new VectorSource();
    const DrawingLayer = new VectorLayer({
      source: drawingSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(0, 0, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "red",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "red",
          }),
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
      layers: [
        osmLayer,
        locationLayer,
        accuracyLayer,
        pinpointLayer,
        DrawingLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 8,
        maxZoom: 15,
        minZoom: 8,
      }),
    });

    map.on("click", (event) => {
      const clickedCoordinate = event.coordinate;
      const lonLat = fromLonLat(clickedCoordinate);
      const pinpointFeature = new Feature({
        geometry: new Point(clickedCoordinate),
      });
      pinpointSource.clear();
      pinpointSource.addFeature(pinpointFeature);
    });

    let drawInteraction;

    const addDrawInteractions = (type) => {
      drawInteraction = new Draw({
        source: drawingSource,
        type: type,
      });

      drawInteraction.on("drawend", (event) => {
        const geometry = event.feature.getGeometry();

        if (type === "LineString") {
          const length = geometry.getLength();
          alert(`length of Line: ${Math.trunc(length)} meters`);
          console.log("Length of line:", length);
        } else if (type === "Polygon") {
          const area = geometry.getArea();
          alert(`Area of polygon: ${Math.trunc(area)} meter squares`);
          console.log("area of polygon :", area);
        }

        map.getViewport().style.cursor = "default";
      });

      map.addInteraction(drawInteraction);
    };

    const removeDrawInteractions = () => {
      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }
    };

    const handleDrawClick = (type) => {
      removeDrawInteractions();
      addDrawInteractions(type);
    };

    // Assign functions to refs
    drawPointRef.current = () => handleDrawClick("Point");
    drawLineStringRef.current = () => handleDrawClick("LineString");
    drawPolygonRef.current = () => handleDrawClick("Polygon");

    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: map.getView().getProjection(),
    });

    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();
      const accuracy = geolocation.getAccuracy();

      const locationPoint = new Feature({
        geometry: new Point(coordinates),
      });
      locationLayer.getSource().clear();
      locationLayer.getSource().addFeature(locationPoint);

      const accuracyGeom = new Circle(coordinates, accuracy);
      const accuracyFeature = new Feature({
        geometry: accuracyGeom,
      });
      accuracyLayer.getSource().clear();
      accuracyLayer.getSource().addFeature(accuracyFeature);

      map.getView().fit(accuracyGeom, { padding: [20, 20, 20, 20] });
    });

    geolocation.setTracking(true);

    return () => map.setTarget(null);
  }, []);

  return (
    <div className={styles.mapcomp} id="map">
      <div className={styles.map}></div>
      <div className={styles.buttons}>
        Drawing tools
        <button
          onClick={() => drawPointRef.current()}
          className={styles.drawbutton}
        >
          Draw Point
        </button>
        <button
          onClick={() => drawLineStringRef.current()}
          className={styles.drawbutton}
        >
          Draw Line
        </button>
        <button
          onClick={() => drawPolygonRef.current()}
          className={styles.drawbutton}
        >
          Draw Polygon
        </button>
        <div className={styles.display}></div>
      </div>
    </div>
  );
};

export default MapComponent;
