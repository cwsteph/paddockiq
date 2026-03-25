const fs = require("fs");
const path = require("path");
const p = (f, c) => {
  fs.mkdirSync(path.dirname(f), {recursive:true});
  fs.writeFileSync(f, c);
  console.log("wrote", f);
};

p(".babelrc", `{
  "presets": ["next/babel"]
}
`);

p("next.config.mjs", `/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: false,
  },
};

export default nextConfig;
`);

console.log("Done.");
