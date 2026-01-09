<h1 align="center">
  <img alt="logo" src="./assets/icon.png" width="124px" style="border-radius:10px"/><br/>
Mobile App </h1>
> This Project is based on [Obytes starter](https://starter.obytes.com)

# HiringBull – Expo + Android + Clerk Setup

This README documents **all required setup steps** to run the app locally, including **Android**, **Expo**, and **Clerk authentication** configuration.

---

## Prerequisites

* [Node.js LTS release](https://nodejs.org/en/)
* [pnpm](https://pnpm.io/installation)
* Java **17**
* Android Studio (with SDKs installed)
* Expo CLI

---
## 1. Clone Repository


Clone the repository and install dependencies:

```
git clone https://github.com/user/repo-name
cd repo-name
pnpm install
```

---

## 2. Environment Setup

### APP_ENV

The project uses environment-based config. Default is:

```
APP_ENV=development
```

So the app loads variables from:

```
.env.development
```

---

## 3. Create Environment File

📁 **Path**: `application/.env.development`

Add the following:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> ⚠️ This key is required for Clerk authentication.

---

## 4. Environment Validation (Zod)

The project validates env variables using Zod.

### Client env schema must include:

```js
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1)
```

### Client env mapping:

```js
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
```

If missing, the app will fail fast with a clear error.

---


## 5. Android SDK Configuration

### Create local.properties

📁 **Path**: `android/local.properties`

```properties
sdk.dir=/Users/<your-username>/Library/Android/sdk
```

For example:

```properties
sdk.dir=/Users/shrikantsurvase/Library/Android/sdk
```

---
### 6. Create env files

Create the following files at the **root level** of the project:

```bash
.env.development
.env.staging   # optional
.env.production # optional
```
## 7. Running the App

### iOS
```sh
pnpm ios
```
### Android

```sh
pnpm android
```

---

## 7. Required Versions (Stable)

| Tool        | Version   |
| ----------- | --------- |
| Java        | 17        |
| Gradle      | 8.5       |
| Android SDK | API 35    |
| Expo        | SDK 49/50 |

---

## 8. Clean & Run

After any env or native change, **always clean cache**:

```bash
pnpm start -c
# or
pnpm android
```

---

## 9. Common Issues

### Missing publishableKey

* Ensure `.env.development` exists
* Restart Metro with `-c`
* Verify via:

```bash
npx expo config --type public
```

---

## 10. Notes

* Do NOT hardcode secrets in source files
* `EXPO_PUBLIC_*` variables are safe for client use
* Same setup works for staging & production using `.env.staging`, `.env.production`

---

✅ Android build fixed
✅ Expo running
✅ Clerk authentication configured

Happy coding 🚀

## ✍️ Documentation

- [Rules and Conventions](https://starter.obytes.com/getting-started/rules-and-conventions/)
- [Project structure](https://starter.obytes.com/getting-started/project-structure)
- [Environment vars and config](https://starter.obytes.com/getting-started/environment-vars-config)
- [UI and Theming](https://starter.obytes.com/ui-and-theme/ui-theming)
- [Components](https://starter.obytes.com/ui-and-theme/components)
- [Forms](https://starter.obytes.com/ui-and-theme/Forms)
- [Data fetching](https://starter.obytes.com/guides/data-fetching)
- [Contribute to starter](https://starter.obytes.com/how-to-contribute/)
