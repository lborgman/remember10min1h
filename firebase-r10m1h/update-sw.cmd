@echo =================================
@findstr "SW_VERSION" public\sw-workbox-input.js
npx workbox-cli injectManifest 

