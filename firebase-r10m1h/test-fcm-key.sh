api_key="fPfFS3Rbage5CcAenfzr53Zc1kaiPvhrHqR6RPf24Co"

curl --header "Authorization: key=$api_key" \
     --header Content-Type:"application/json" \
     https://fcm.googleapis.com/fcm/send \
     -d "{\"registration_ids\":[\"ABC\"]}"
