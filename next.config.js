const MillionLint = require("@million/lint");
/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: ['./styles'],
    },
};

module.exports = MillionLint.next({
    enabled: true,
    rsc: true,
})(nextConfig);
