import { useEffect, useState } from "react";
import styles from "./MapComponent.module.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import Geolocation from "ol/Geolocation";

const MapComponent = (props) => {
  const [pin, setPin] = useState([0, 0]);

  useEffect(() => {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const map = new Map({
      target: "map",
      layers: [osmLayer, new TileLayer()],
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
      console.log("Clicked Coordinate:", clickedCoordinate);
    });

    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: map.getView().getProjection(),
    });
    geolocation.once("change:position", () => {
      const coordinates = geolocation.getPosition();
      map.getView().animate({ center: coordinates, zoom: 15 });
      console.log("cuurrent location", coordinates);
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
