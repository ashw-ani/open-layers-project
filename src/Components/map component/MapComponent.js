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
  // Refs to hold functions for drawing interactions
  const drawPointRef = useRef();
  const drawLineStringRef = useRef();
  const drawPolygonRef = useRef();

  useEffect(() => {
    // Initialize OpenLayers map and layers
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
      target: "map", // Target element to render the map
      layers: [
        osmLayer,
        locationLayer,
        accuracyLayer,
        pinpointLayer,
        DrawingLayer,
      ],
      view: new View({
        center: [0, 0], // Initial center of the map
        zoom: 8, // Initial zoom level
        maxZoom: 15, // Maximum zoom level
        minZoom: 8, // Minimum zoom level
      }),
    });

    // Event listener for clicking on the map to add pinpoint
    map.on("click", (event) => {
      const clickedCoordinate = event.coordinate;
      const lonLat = fromLonLat(clickedCoordinate);
      const pinpointFeature = new Feature({
        geometry: new Point(clickedCoordinate),
      });
      pinpointSource.clear(); // Clear existing pinpoints
      pinpointSource.addFeature(pinpointFeature); // Add new pinpoint
    });

    let drawInteraction;

    // Function to add drawing interactions based on the type (Point, LineString, Polygon)
    const addDrawInteractions = (type) => {
      drawInteraction = new Draw({
        source: drawingSource,
        type: type,
      });

      // Event listener for when drawing ends
      drawInteraction.on("drawend", (event) => {
        const geometry = event.feature.getGeometry();

        if (type === "LineString") {
          const length = geometry.getLength(); // Calculate length of LineString
          alert(`Length of Line: ${Math.trunc(length)} meters`); // Display length
          console.log("Length of line:", length);
        } else if (type === "Polygon") {
          const area = geometry.getArea(); // Calculate area of Polygon
          alert(`Area of Polygon: ${Math.trunc(area)} square meters`); // Display area
          console.log("Area of Polygon:", area);
        }

        map.getViewport().style.cursor = "default"; // Reset cursor
      });

      map.addInteraction(drawInteraction); // Add draw interaction to the map
    };

    // Function to remove drawing interactions
    const removeDrawInteractions = () => {
      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }
    };

    // Function to handle draw button clicks
    const handleDrawClick = (type) => {
      removeDrawInteractions(); // Remove existing draw interactions
      addDrawInteractions(type); // Add draw interaction based on the selected type
    };

    // Assign functions to refs for draw buttons
    drawPointRef.current = () => handleDrawClick("Point");
    drawLineStringRef.current = () => handleDrawClick("LineString");
    drawPolygonRef.current = () => handleDrawClick("Polygon");

    // Geolocation setup to track user's position
    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: map.getView().getProjection(),
    });

    // Event listener for when geolocation position changes
    geolocation.on("change:position", () => {
      const coordinates = geolocation.getPosition();
      const accuracy = geolocation.getAccuracy();

      // Add location point feature
      const locationPoint = new Feature({
        geometry: new Point(coordinates),
      });
      locationLayer.getSource().clear(); // Clear existing location points
      locationLayer.getSource().addFeature(locationPoint); // Add new location point

      // Add accuracy circle feature
      const accuracyGeom = new Circle(coordinates, accuracy);
      const accuracyFeature = new Feature({
        geometry: accuracyGeom,
      });
      accuracyLayer.getSource().clear(); // Clear existing accuracy circles
      accuracyLayer.getSource().addFeature(accuracyFeature); // Add new accuracy circle

      map.getView().fit(accuracyGeom, { padding: [20, 20, 20, 20] }); // Zoom to accuracy circle
    });

    geolocation.setTracking(true); // Start geolocation tracking

    // Cleanup function to remove map when component unmounts
    return () => map.setTarget(null);
  }, []);

  return (
    // Render map container and draw buttons
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
