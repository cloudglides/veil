<p align="center"><img width="222" height="104" alt="logo" src="https://github.com/user-attachments/assets/4da72eab-7273-4959-bd7f-997366de564f" /></p>




<h1 align="center">Veil</h1>
<p align="center">
  <a href="#installation">Install</a> •
  <a href="#how-it-works">How it works</a> •
  <a href="#api-reference">API reference</a> •
  <a href="#performance">Performance</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@cloudglides/veil">NPM</a> •
  <a href="https://github.com/cloudglides/veil">GitHub</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  A browser fingerprinting library based on <b>static traits</b> and
  <b>information theory</b>, designed to generate deterministic,
  reproducible fingerprints without relying on cookies or storage.
</p>



## Features

- **Deterministic Hashing** - Consistent fingerprints across browser refreshes
- **Mathematical Rigor** - Information-theoretic entropy sources with Bayesian scoring
- **Tamper Detection** - Identifies suspicious patterns and anomalies in entropy data
- **Browser Compatible** - Works in modern browsers via WASM
- **Minimal Overhead** - Lightweight library with no external dependencies
- **Detailed Metrics** - Uniqueness, confidence, and per-source entropy analysis

## Installation

```bash
npm install @cloudglides/veil
# or
pnpm add @cloudglides/veil
```

## Quick Start

```javascript
import { getFingerprint } from "@cloudglides/veil";

// Simple hash
const hash = await getFingerprint();
console.log(hash); // e.g., "a3f5d8c..."

// Detailed analysis
const fingerprint = await getFingerprint({ detailed: true });
console.log(fingerprint.hash); // fingerprint hash
console.log(fingerprint.uniqueness); // 0-1 uniqueness score
console.log(fingerprint.confidence); // 0-1 confidence score
console.log(fingerprint.tampering_risk); // 0-1 tampering risk
console.log(fingerprint.anomalies); // array of detected anomalies
console.log(fingerprint.sources); // entropy sources and their contributions
```

## API Reference

### `getFingerprint(options?): Promise<string | FingerprintResponse>`

Generates a browser fingerprint.

**Options:**

```typescript
interface FingerprintOptions {
  entropy?: {
    userAgent?: boolean; // default: true
    canvas?: boolean; // default: true
    webgl?: boolean; // default: true
    fonts?: boolean; // default: true
    storage?: boolean; // default: true
    screen?: boolean; // default: true
  };
  hash?: "sha256" | "sha512"; // default: "sha256"
  detailed?: boolean; // return full response (default: false)
}
```

**Returns:**

- `string` - 64 or 128 character hash (if `detailed: false`)
- `FingerprintResponse` - Full analysis object (if `detailed: true`)

### `compareFingerpints(fp1, fp2): Promise<{ similarity: number; match: boolean }>`

Compares two fingerprints using Levenshtein distance.

```javascript
const fp1 = await getFingerprint();
const fp2 = await getFingerprint();
const { similarity, match } = await compareFingerpints(fp1, fp2);

console.log(similarity); // 0-1, higher = more similar
console.log(match); // true if similarity > 0.95
```

### `matchProbability(stored, current): Promise<{ bestMatch: number; confidence: number }>`

Finds best match from a stored fingerprint set.

```javascript
const currentFp = await getFingerprint();
const storedFps = [fp1, fp2, fp3];

const { bestMatch, confidence } = await matchProbability(storedFps, currentFp);
console.log(bestMatch); // 0-1 highest similarity
console.log(confidence); // probability estimate
```

## Entropy Sources

Veil collects entropy from multiple sources:

- **userAgent** - Browser user agent string
- **canvas** - HTML5 canvas fingerprinting
- **webgl** - WebGL capabilities and renderer
- **fonts** - Installed system fonts
- **storage** - LocalStorage and SessionStorage
- **screen** - Display resolution and color depth
- **distribution** - KS-test on seeded random samples
- **complexity** - Lempel-Ziv complexity
- **spectral** - Spectral entropy analysis
- **approximate** - Approximate entropy
- **os** - Operating system detection
- **language** - Browser language preferences
- **timezone** - System timezone
- **hardware** - CPU cores and device memory
- **plugins** - Browser plugins/extensions
- **browser** - Browser vendor and version
- **adblock** - Adblock detection
- **webFeatures** - Supported web APIs

## Tamper Detection

Each fingerprint includes a `tampering_risk` score (0-1) and list of detected `anomalies`:

```javascript
const fp = await getFingerprint({ detailed: true });

if (fp.tampering_risk > 0.5) {
  console.warn("High tampering risk detected:", fp.anomalies);
}
```

**Detected Anomalies:**

- Suspiciously uniform entropy across sources
- Duplicate values in multiple sources
- Missing critical entropy sources
- Cross-source inconsistencies (e.g., canvas/webgl mismatch)
- Suspicious placeholder values (null, fake, mock)

## How It Works

1. **Entropy Collection** - Gathers browser characteristics from 25+ sources
2. **Hashing** - Combines entropy sources and applies SHA-256/512
3. **Scoring** - Calculates uniqueness via Bayesian methods
4. **Anomaly Detection** - Analyzes entropy distribution for tampering signs
5. **Output** - Returns fingerprint hash with optional detailed metrics

The library uses WASM (via Rust) for computationally intensive operations:

- Kolmogorov-Smirnov test (distribution analysis)
- Lempel-Ziv complexity
- Spectral entropy
- Approximate entropy

## Performance

- Generation: ~50-100ms (first call includes WASM init)
- Subsequent calls: ~20-30ms
- Bundle size: ~23KB (gzipped)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser supporting:
  - WebAssembly
  - Web Crypto API
  - Canvas API

## License

MIT - See LICENSE file


Contributions welcome. Please open an issue or PR on GitHub.

---

**Disclaimer:** Browser fingerprinting has privacy implications. Use responsibly and ensure compliance with local regulations and user privacy expectations.
