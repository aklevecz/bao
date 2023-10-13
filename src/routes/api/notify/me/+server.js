import { SECRET_VAPID_KEY } from "$env/static/private";
import { PUBLIC_VAPID_KEY } from "$env/static/public";
import db from "$lib/db";
import webpush from "web-push";

const defaultSub = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/fZnUE3k9TDI:APA91bFkbJL6zvqjxurjorakBPZyo4UtG5zZOb8LbcGf9-BtB9y2KkanaJj4MIWlA1B1w6BYWnSmuHMtjZs_HlpLX8qfTVLrriBrYehUPJ0QW1aHur4TJQSQ2JGuOXodi9mBaYdL5rTi",
  expirationTime: null,
  keys: {
    p256dh: "BMJ-h1xC4lB7uIyCxv1eb7z8jkzt5_dAl7ie--O134fHEd9god1WTpV9Ko7Y91qDn5W0Dpik5MmxYkKFBC-0Ij4",
    auth: "p-so7GHCfQf2irdpGZ2_tQ",
  },
};

const ds = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cRd05xVgLxw:APA91bHiXQfPd2MHL-v1hMikuj7MGRCoaqxocXSileciBfxvTCh_ae0Vc0m6CcU0ZpJ6P55VOdrRPNkslcAM3ijME-pCZeYWvMrARkse-LHy1D3n0WRnn_4_ce0nsv6-zJ02r62tx40C",
  expirationTime: null,
  keys: {
    p256dh: "BIMXf5tcCQHz-yHGGlwVGkNQ_oEXmlL9WFN0yenGhyPl0DnBkXw4vsvRNhabuc85svSULYwd_g7QCwRWqQ_9S_0",
    auth: "zp2WYTREnxWzirPdaaphwA",
  },
};
const vapidDetails = {
  publicKey: PUBLIC_VAPID_KEY,
  privateKey: SECRET_VAPID_KEY,
  subject: "mailto:test@test.test",
};

/**
 *
 * @param {any} subscriptions
 */
function sendNotifications(subscriptions = [defaultSub]) {
  // Create the notification content.
  const image = "https://cdn.glitch.com/614286c9-b4fc-4303-a6a9-a4cef0601b74%2Flogo.png?v=1605150951230";

  const notification = JSON.stringify({
    title: "Hello, Jackson!",
    options: {
      body: `ID: ${Math.floor(Math.random() * 100)}`,
      icon: image,
    },
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails,
  };
  // Send a push message to each client specified in the subscriptions array.
  // @ts-ignore
  subscriptions.forEach((subscription) => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr(endpoint.length - 8, endpoint.length);
    webpush
      .sendNotification(subscription, notification, options)
      .then((result) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch((error) => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const data = await request.json();
  console.log(data);
  data.endpoint =
    "https://web.push.apple.com/QNNX2O3YZS5JDekKsf5cBgQVIDc7aqZPXmW31mvOsjVw8VDAxW4mX52yrwG8VKOgRnjsk3I4OPziHljlzWKt80FMY7FmKGjE00l2O8UJrjb42xX2jxHHnlFcPfQlM2pEM4VGl8QWZAw1pddcE2nah9xML3axNhGN5BW6_9gMvJE";
  const subscription = await db.findNotificationSubscription(data.endpoint);
  console.log(subscription);
  sendNotifications([subscription]);
  return new Response();
}
