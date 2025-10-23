"use client";

import React, { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";
import HouseIcon from "../../../public/HouseIcon";

export default function LoadingScreen({ fadeOut }: { fadeOut?: boolean }) {
  return (
    <div className={`${styles.splashScreen} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.logoBlock}>
        <HouseIcon color="white" />
        <h2 className={styles.mainTitle}>the wandered</h2>
      </div>
    </div>
  );
}
