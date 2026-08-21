# 프리랜서 AI 비서 — iPhone Expo Go 호환판

이 프로젝트는 실제 iPhone의 App Store용 Expo Go가 지원하는 Expo SDK 54 기준으로 맞춘 버전입니다.

## 실행 순서 (Windows)
1. 압축을 풉니다.
2. 폴더 안 `package.json`이 보이는 위치에서 주소창에 `cmd` 입력 후 Enter.
3. 기존 설치 흔적이 있다면 아래 명령을 순서대로 실행합니다.

```
rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install
npx expo start -c
```

4. QR코드가 뜨면 iPhone 기본 카메라로 촬영해 Expo Go에서 엽니다.

※ Node.js 20.19 이상 권장.
