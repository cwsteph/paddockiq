const https = require("https");
const siteId = "232dcd47-f178-442f-adb2-6dc1a59c47bf";

// Use Netlify API to update build image
// First we need to get the token from the browser cookies
// Actually - lets just use the _netlify_account cookie approach
// The simplest fix: delete and recreate the site connection

// Actually the real fix here is simpler - the site was 
// originally created from Netlify Drop which set focal image
// The API PATCH endpoint can update it

console.log("Site ID:", siteId);
console.log("Need to PATCH https://api.netlify.com/api/v1/sites/" + siteId);
console.log("Body: {build_settings: {ubuntu_distro: noble}}");
