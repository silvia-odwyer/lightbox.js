
interface RequestParams {
  license_key: String;
  plan_type: String;
}

export const asyncFetch = async (url: URL, body: RequestParams) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    let licenseKeyValid = data.license_valid;
  } catch (error) {
    console.log("error", error)
  }
}

export const initLightboxJS = (licenseKey: string, plan_type: string) => {
  var body = {
    license_key: licenseKey,
    plan_type: plan_type,
  };

  let url = new URL("https://lightboxjs-server.herokuapp.com/license");
  asyncFetch(url, body)
};

export * from "./components/Image";
export * from "./components/ItemLightbox";
export * from "./components/SlideshowLightbox";
export * from "./components/VideoLightbox";

