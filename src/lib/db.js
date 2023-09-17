import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from "$env/static/private";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: { accessKeyId: AWS_S3_ACCESS_KEY, secretAccessKey: AWS_S3_SECRET_KEY },
});
const docClient = DynamoDBDocumentClient.from(client);

const table = "bao";

/** @param {string} chickenHex */
const findUserByHex = async (chickenHex) => {
  const command = new GetCommand({
    TableName: table,
    Key: {
      pk: chickenHex,
      sk: chickenHex,
    },
  });
  const response = await docClient.send(command);
  return response.Item;
};

/** @param {any} subscription */
const createNotificationSubscription = async (subscription) => {
  const command = new PutCommand({
    TableName: table,
    Item: {
      pk: subscription.endpoint,
      sk: subscription.endpoint,
      ...subscription,
    },
  });

  try {
    const response = await docClient.send(command);
  } catch (e) {
    console.error("error saving subscription, ", subscription);
    return null;
  }

  return { success: true, ...subscription };
};

/** @param {string} endpoint */
const findNotificationSubscription = async (endpoint) => {
  const command = new GetCommand({
    TableName: table,
    Key: {
      pk: endpoint,
      sk: endpoint,
    },
  });

  try {
    const response = await docClient.send(command);

    return response.Item;
  } catch (e) {
    console.error("there was an error fetching the subscription");
    return null;
  }
};

/**
 *
 * @typedef {{chicken_name:string, secret:string}} UserCreation
 */

/** @param {UserCreation} user */
const createUser = async (user) => {
  const command = new PutCommand({
    TableName: table,
    Item: {
      pk: user.secret,
      sk: user.secret,
      chicken_name: user.chicken_name,
      chicken_tokens: 0,
    },
  });
  const response = await docClient.send(command);

  return { chicken_name: user.chicken_name, sk: user.secret, pk: user.secret, chicken_tokens: 0 };
};

/** @typedef {{pk:string, sk:string}} User */
/**
 *
 * @param {number} amount
 * @param {User} user
 */
const updateChickenTokens = async (amount, user) => {
  const command = new UpdateCommand({
    TableName: table,
    Key: {
      pk: user.sk,
      sk: user.sk,
    },
    UpdateExpression: "add chicken_tokens :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  });
  const res = await docClient.send(command);
  if (res.Attributes) {
    const newChickenAmount = res.Attributes.chicken_tokens;
    return newChickenAmount;
  }
  return null;
};

const fetchAllUsers = async () => {
  const command = new ScanCommand({ TableName: table });
  const response = await docClient.send(command);

  return response.Items || [];
};

/**
 *  @param {number} sessionStart
 * @param {object} messages
 */
const addWaitlistMessages = async (sessionStart, messages) => {
  const command = new PutCommand({
    TableName: table,
    Item: {
      pk: `MESSAGE#${sessionStart}`,
      sk: "TOPIC#waitilist",
      messages: JSON.stringify(messages),
    },
  });

  const res = await docClient.send(command);
};

export default {
  findUserByHex,
  createUser,
  fetchAllUsers,
  updateChickenTokens,
  addWaitlistMessages,
  createNotificationSubscription,
  findNotificationSubscription,
};

// FIND UNIQUE USER
//   const user = await prisma.users.findUnique({
//     where: { secret: chickenHex },
//     include: {
//       chickenTokens: true,
//     },
//   });
