# string-of-numbers-deflate

A lightweight TypeScript utility for compressing comma-separated strings of numbers into compact, URL-safe Base64 (ASCII) strings.

Ideal for game state serialization, URL sharing, or reducing payload size in web applications (PixiJS, Cocos Creator, etc.).

## 🚀 Efficiency Example
*   **Input:** `"1,300,237,188,26,3,4,1,256"` (26 characters)
*   **Output:** `"AQACARaiMRMs"` (12 characters)
*   **Compression:** ~54% reduction for small sets, even more for large sorted arrays.

---

## 🛠 Features
- **Bit-Packing:** Uses only the required number of bits per value (e.g., 9 bits for numbers up to 511).
- **Delta Encoding:** Automatically sorts and calculates residuals to minimize bit-width (optional).
- **Zero Dependencies:** Pure TypeScript/JavaScript implementation.
- **Node.js & Browser Support:** Works with `btoa`/`atob` or global polyfills.

---

## 📦 Installation
```bash
pnpm add string-of-numbers-deflate
```

### 📊 Benchmarks
The table below shows the compression ratio (Raw String vs Base64) for different scenarios. 
*Measured in characters.*


| Scenario (Input Type) | keepOrder | Raw | Packed | Ratio |
| :--- | :---: | :---: | :---: | :---: |
| **Simple Numbers** [1,2,3,4,5] | ✅ | 9 | 4 | **x2.3** |
| **Simple Numbers** [1,2,3,4,5] | ❌ | 9 | 4 | **x2.3** |
| **Random 50** (range 0-300) | ✅ | 182 | 76 | **x2.4** |
| **Random 50** (range 0-300) | ❌ | 183 | 44 | **x4.2** |
| **Random 500** (range 0-300) | ✅ | 1833 | 752 | **x2.4** |
| **Random 500** (range 0-300) | ❌ | 1824 | 168 | **x10.9** |
| **Random 1000** (range 0-300) | ✅ | 3612 | 1500 | **x2.4** |
| **Random 1000** (range 0-300) | ❌ | 3652 | 336 | **x10.9** |
| **Repeated 900** (3x each 0-300) | ✅ | 3271 | 1352 | **x2.4** |
| **Repeated 900** (3x each 0-300) | ❌ | 3271 | 152 | **x21.5** |

> **Note:** The best results (**x10 - x21**) are achieved when `keepOrder` is false, as the library sorts numbers and applies delta-encoding before bit-packing.