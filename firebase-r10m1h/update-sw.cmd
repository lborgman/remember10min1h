@echo =================================
@findstr "SW_VERSION" public\sw-workbox-input.js | findstr const
npx workbox-cli injectManifest 

