import React, {useEffect} from 'react'
import styles from './styles.module.css'
import './css/tailwind.css';
import {VideoLightbox} from "./VideoLightbox";
import {AnimImage as Image} from "./AnimImage";
import {SlideshowLightbox} from "./SlideshowLightbox";
import axios from "axios";

const initLightboxJS = (licenseKey, plan_type) => {
  console.log("init lightboxjs")
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

export { VideoLightbox, Image, SlideshowLightbox, initLightboxJS }