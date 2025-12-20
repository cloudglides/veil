interface FingerprintOptions {
  entropy: {
    userAgent?: boolean;
    canvas?: boolean;
    webgl?: boolean;
    fonts?: boolean;
    storage?: boolean;
    screen?: boolean;
  };
  hash?: "sha256" | "sha512";
}
