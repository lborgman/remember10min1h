curl -X POST -H "Authorization: key=fPfFS3Rbage5CcAenfzr53Zc1kaiPvhrHqR6RPf24Co" -H "Content-Type: application/json" -d '{
  "notification": {
    "title": "Testing FCM",
    "body": "5 to 1",
    "icon": "firebase-logo.png",
    "click_action": "http://sr.se"
  },
  "to": "dm7MsfHALjaaUlYQ1A9W1r:APA91bFKrK42nXEB-cVKWmlcDIWzkqRpHXq5y0cUJxNc1GGNiecbb-mFll4CnmAznGlbfbBNCho28Nuu2-zr8gvD2AwsQp1YJ-f8A76fuhIbb8Mtd7ezjNPRDT5MP2D-n2TLWMxP03ip"
}' "https://fcm.googleapis.com/fcm/send"
