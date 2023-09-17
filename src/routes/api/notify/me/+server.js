// import { SECRET_VAPID_KEY } from "$env/static/private";
// import { PUBLIC_VAPID_KEY } from "$env/static/public";
// import webpush from "web-push";

// const defaultSub = {
//   endpoint:
//     "https://fcm.googleapis.com/fcm/send/fZnUE3k9TDI:APA91bFkbJL6zvqjxurjorakBPZyo4UtG5zZOb8LbcGf9-BtB9y2KkanaJj4MIWlA1B1w6BYWnSmuHMtjZs_HlpLX8qfTVLrriBrYehUPJ0QW1aHur4TJQSQ2JGuOXodi9mBaYdL5rTi",
//   expirationTime: null,
//   keys: {
//     p256dh: "BMJ-h1xC4lB7uIyCxv1eb7z8jkzt5_dAl7ie--O134fHEd9god1WTpV9Ko7Y91qDn5W0Dpik5MmxYkKFBC-0Ij4",
//     auth: "p-so7GHCfQf2irdpGZ2_tQ",
//   },
// };

// const vapidDetails = {
//   publicKey: PUBLIC_VAPID_KEY,
//   privateKey: SECRET_VAPID_KEY,
//   subject: "mailto:test@test.test",
// };

// /**
//  *
//  * @param {any} subscriptions
//  */
// function sendNotifications(subscriptions = [defaultSub]) {
//   // Create the notification content.
//   const notification = JSON.stringify({
//     title: "Hello, Notifications!",
//     options: {
//       body: `ID: ${Math.floor(Math.random() * 100)}`,
//     },
//   });
//   // Customize how the push service should attempt to deliver the push message.
//   // And provide authentication information.
//   const options = {
//     TTL: 10000,
//     vapidDetails: vapidDetails,
//   };
//   // Send a push message to each client specified in the subscriptions array.
//   // @ts-ignore
//   subscriptions.forEach((subscription) => {
//     const endpoint = subscription.endpoint;
//     const id = endpoint.substr(endpoint.length - 8, endpoint.length);
//     webpush
//       .sendNotification(subscription, notification, options)
//       .then((result) => {
//         console.log(`Endpoint ID: ${id}`);
//         console.log(`Result: ${result.statusCode}`);
//       })
//       .catch((error) => {
//         console.log(`Endpoint ID: ${id}`);
//         console.log(`Error: ${error} `);
//       });
//   });
// }

// /** @type {import('./$types').RequestHandler} */
// export async function POST({ request }) {
//   const data = request.json();
//   console.log(data);
//   // const subscription = db.get("subscriptions").find({ endpoint: data.endpoint }).value();
//   sendNotifications();
//   return new Response();
// }