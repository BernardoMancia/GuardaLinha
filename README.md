# BlockCall — Smart Call Blocker

> Android app to intelligently block incoming calls using 9 configurable rule types, built with React Native + Expo and a native Kotlin `CallScreeningService`.

---

## 🌎 English

### Features
- 🚫 Block ALL calls
- 🛡️ Block all except whitelist
- 📵 Block specific numbers
- 📊 Block number ranges
- 📋 Block number lists (batch)
- 🌍 Block international calls (DDI ≠ +55)
- 📍 Block by specific DDD (Brazilian area codes)
- 🔢 Block by prefix (first 4 digits)
- 🔣 Block by suffix (last 4 digits)
- 📋 Blocked call history log with unblock option
- 🎨 Cybersecurity / Glassmorphism dark UI

### Requirements
- Android 10+ (API 29+)
- Node.js 18+
- Android Studio (for local builds)
- EAS CLI (for cloud builds)

### Setup

```bash
git clone https://github.com/your-user/app-block-ligacao
cd app-block-ligacao
npm install
```

### Build (Local)

```bash
# Generate native Android code
npx expo prebuild --platform android --clean

# Build and run on connected device
npx expo run:android
```

### Build APK (EAS Cloud)

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

### Permissions Setup
After installing the APK, the app will guide you to set BlockCall as the **default call screening app** in Android settings. This is required for call blocking to function.

---

## 🇧🇷 Português (PT-BR)

### Funcionalidades
- 🚫 Bloquear TODAS as ligações
- 🛡️ Bloquear tudo com exceções (whitelist)
- 📵 Bloquear números específicos
- 📊 Bloquear ranges de números
- 📋 Bloquear listas de números (em lote)
- 🌍 Bloquear ligações internacionais (DDI ≠ +55)
- 📍 Bloquear por DDD específico (67 DDDs brasileiros)
- 🔢 Bloquear por prefixo (4 primeiros dígitos)
- 🔣 Bloquear por sufixo (4 últimos dígitos)
- 📋 Histórico de ligações bloqueadas com opção de liberar
- 🎨 Interface Cybersecurity / Glassmorphism dark

### Requisitos
- Android 10+ (API 29+)
- Node.js 18+
- Android Studio (para builds locais)
- EAS CLI (para builds na nuvem)

### Instalação

```bash
git clone https://github.com/seu-usuario/app-block-ligacao
cd app-block-ligacao
npm install
```

### Build Local

```bash
# Gerar código nativo Android
npx expo prebuild --platform android --clean

# Compilar e rodar no dispositivo conectado
npx expo run:android
```

### Build APK (EAS Cloud)

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

### Configuração de Permissões
Após instalar o APK, o app guiará você para definir o **BlockCall como app de triagem de chamadas padrão** nas configurações do Android. Essa permissão é obrigatória para o bloqueio funcionar.

### Arquitetura
```
CallScreeningService (Kotlin) ← intercepta chamadas
↕ SharedPreferences
CallBlockerModule (Kotlin)     ← bridge nativa
↕ Native Module
React Native (TypeScript)      ← UI + regras
↕ AsyncStorage
RulesStorage                   ← persistência
```

---

## License
MIT
