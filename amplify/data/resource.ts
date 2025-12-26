import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1: Define your schema ===========================================
This defines the models that will be turned into your cloud database.
The authorization rule ensures anyone with an API key can read/write.
=========================================================================*/
const schema = a.schema({
  BucketItem: a
    .model({
      text: a.string().required(),
      completed: a.boolean().default(false),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
