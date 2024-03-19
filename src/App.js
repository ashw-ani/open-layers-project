import { useEffect } from "react";
import styles from "./App.module.css";
import MapComponent from "./Components/map component/MapComponent";
import Header from "./Components/Header/Header";

function App() {
  useEffect(() => {});
  return (
    <div className={styles.App}>
      <Header heading="Maping Application" />
      <MapComponent currentLocation={[28, 77]} />
    </div>
  );
}

export default App;
