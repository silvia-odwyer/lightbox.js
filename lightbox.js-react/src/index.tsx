import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import styles from './styles.module.css'
import axios from "axios";
import {
  wrapNums,
  getVideoHeight,
  getVideoWidth,
  shouldAutoplay,
  openFullScreen,
  closeFullScreen,
} from './utility'
import {SlideshowLightbox} from "./SlideshowLightbox"
import {AnimImage} from "./AnimImage"

export const initLightboxJS = (licenseKey: string, plan_type: string) => {
  var body = {
    license_key: licenseKey,
    plan_type: plan_type,
  };

  axios.post('https://lightboxjs-server.herokuapp.com/license', body)
    .then(function (response) {

      let licenseKeyValid = response.data.license_valid;

      if (!licenseKeyValid) {
        console.warn("Lightbox.js: Invalid license key specified, a valid license key must be provided.")
      }
    })
    .catch(function (error) {
      console.log(error);
    });

};


export { SlideshowLightbox, AnimImage as Image }