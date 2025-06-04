import axios from "axios";
export const initLightboxJS = (licenseKey: string, plan_type: string) => {
    var body = {
      license_key: licenseKey,
      plan_type: plan_type,
    };
  
    axios.post('https://lightboxjs-server.herokuapp.com/license', body)
      .then(function (response) {
  
        let licenseKeyValid = response.data.license_valid;
  
      })
      .catch(function (error) {
      });
  
};

export * from "./components";