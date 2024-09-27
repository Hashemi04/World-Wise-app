import { lazy, Suspense } from "react";
import styles from "./AppLayout.module.css";
import Spinner from "../components/Spinner";

const Map = lazy(() => import("../components/Map"));
const Sidebar = lazy(() => import("../components/Sidebar"));
const User = lazy(() => import("../components/User"));

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<Spinner />}>
        <Sidebar />
        <Map />
        <User />
      </Suspense>
    </div>
  );
}
