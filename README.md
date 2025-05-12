# 🧾 Punto de Venta Móvil

Aplicación móvil construida con [Expo](https://expo.dev), [React Native](https://reactnative.dev), y [TypeScript](https://www.typescriptlang.org/) para gestionar órdenes, productos y realizar impresión de tickets vía Bluetooth.

## 🚀 Requisitos

- Node.js `>=18`
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Dispositivo físico con la app instalada desde `expo run:android` (necesario para impresión Bluetooth)
- APK build con soporte para `react-native-bluetooth-escpos-printer`

## 📦 Instalación

1. Clona el proyecto:

   ```bash
   git clone "url del repo"
   cd tu-repo
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Asegúrate de tener una `.env` configurada correctamente con la URL base de la API, por ejemplo:

   ```env
   API_URL=http://{IP_ADDRESS}:8000/api
   ```

4. Aplica parches si es necesario:

   ```bash
   npm run postinstall
   ```

## 📱 Ejecución

Primero asegúrate de tener tu dispositivo conectado y el APK instalado:

```bash
expo run:android
```

Luego corre el servidor de desarrollo:

```bash
npx expo start
```

## 🛠️ Scripts

- `npm run start`: inicia el proyecto con soporte para el cliente dev personalizado
- `npm run android`: ejecuta en dispositivo/emulador Android
- `npm run web`: ejecuta en navegador (sin soporte para Bluetooth)
- `npm run test`: corre pruebas unitarias con Jest
- `npm run lint`: analiza el código con ESLint
- `npm run reset-project`: reinicia el proyecto (ver script en `/scripts/reset-project.js`)

## 📂 Estructura

- `/app`: lógica de rutas y pantallas
- `/components`: componentes reutilizables (como `OrderCard`)
- `/hooks`: lógica personalizada para datos y utilidades
- `/context`: `AuthContext` y `FetchContext` para manejo de sesión y API
- `/printing`: lógica para imprimir tickets

## ✨ Funcionalidades

- Autenticación con JWT
- Creación y manejo de órdenes
- Filtrado por cliente
- Impresión de órdenes por Bluetooth
- Dashboard con estadísticas

## 📋 Notas

- Este proyecto usa [`react-native-bluetooth-escpos-printer`](https://github.com/detanx/react-native-bluetooth-escpos-printer), por lo que no es compatible con Expo Go.
- Asegúrate de tener permisos Bluetooth habilitados en tu dispositivo Android.
