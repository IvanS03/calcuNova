# 📱 Calculator App

A modern calculator built with React Native + Expo, featuring a clean UI, dark/light mode, and a powerful unit converter.

---

## ✨ Features

* 🧮 Basic calculator functionality
* 🌙 Dark mode & ☀️ Light mode
* 🔄 Unit converter with multiple categories:

  * Length
  * Weight
  * Volume
  * Temperature
  * Area
  * Speed
* ⚡ Fast and lightweight
* 📱 Built with Expo Router

---

## 📦 Tech Stack

* React Native
* Expo
* TypeScript
* Expo Router

---

## 🔄 Unit Conversion System

The app uses a **base unit conversion system (SI units)** for accuracy and consistency.

Each unit defines:

* `toBase`: converts to a base unit
* `fromBase`: converts from the base unit

### Example

```ts
const base = from.toBase(value);
return to.fromBase(base);
```

---

## 📂 Project Structure

```
/app
/components
/utils
/constants
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
npx expo start
```

### Run on Android

```bash
npx expo run:android
```

### Run on iOS

```bash
npx expo run:ios
```

---

## ⚙️ Configuration

If using ads (AdMob):

Make sure to configure:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "YOUR_ADMOB_APP_ID"
        }
      ]
    ]
  }
}
```

---

## 🧠 Core Conversion Logic

```ts
export function convert(
  value: number,
  fromKey: string,
  toKey: string,
  category: UnitCategory
): number {
  const cat  = CATEGORIES.find(c => c.key === category)!;
  const from = cat.units.find(u => u.key === fromKey)!;
  const to   = cat.units.find(u => u.key === toKey)!;
  const base = from.toBase(value);
  return to.fromBase(base);
}
```

---

## 🎯 Future Improvements

* 📊 History of calculations
* ⭐ Favorite conversions
* 🌍 Localization / multi-language
* 💾 Persistent settings

---

## 📄 License

MIT License

---

## 👤 Author

Built by you 🚀
