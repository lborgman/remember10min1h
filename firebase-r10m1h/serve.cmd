@rem https://firebase.google.com/docs/functions/local-emulator
@rem https://jsmobiledev.com/article/firebase-emulator-guide/

@rem set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Lennart\Google Drive\firebase-caped\test-serviceAccountKey.json
@rem firebase serve --only functions,hosting
@rem firebase serve --only hosting --port 5004
firebase emulators:start
