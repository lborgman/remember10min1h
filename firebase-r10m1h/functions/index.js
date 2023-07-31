const localVer = "0.0.1";
// eslint: https://stackoverflow.com/questions/65606902/did-firebase-cloud-functions-eslint-change-recently

const colors = require('colors'); // Console colors
const admin = require("firebase-admin");
admin.initializeApp();

const functions = require("firebase-functions");
// const functions = await import("firebase-functions");
// const functions = import("firebase-functions");

const ourUtil = require("./modules/util.js");
// console.log("before getWebJsonIf")
// ourUtil.getWebJsonIf();
// console.log("after getWebJsonIf")

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    ourUtil.getWebJsonIf();
    // functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

exports.funFcm = functions.https.onRequest(async (request, response) => {
    const webJsonIf = ourUtil.getWebJsonIf();
    // functions.logger.info("Hello fcm!", { structuredData: true });
    // response.send("Hello from fcm!");
    console.log("testfcm starting");
    const trace = {
        localVer: localVer,
    };
    const respObj = {
        trace: trace,
    };

    const wanted = JSON.parse(JSON.stringify(webJsonIf.testfcm.wanted));

    try {
        trace.where = "Before getAndValidateParameters";
        if (!ourUtil.getAndValidateParameters(request, response, wanted, trace)) return;

        if (!wanted.fcmtoken) throw Error("no fcmtoken");

        const sent = await ourUtil.sendFCM(wanted.fcmtoken, { message: wanted.msg });

        // await doIt();
        respObj.answer = { sent: sent };
        ourUtil.respondWithAllowOrigin(response, 200, respObj);

    } catch (err) {
        ourUtil.respond500(response, respObj, err);
    }

});
