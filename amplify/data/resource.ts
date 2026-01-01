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

  Memory: a
    .model({
      title: a.string().required(),
      description: a.string(),
      date: a.date().required(),
      images: a.string().array(), // Stores S3 paths
      cost: a.float(),
      location: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Milestone: a
    .model({
      title: a.string().required(),
      date: a.date().required(),
      icon: a.string(),
      isReached: a.boolean().default(false),
      order: a.integer(),
      category: a.string(), // e.g. "relationship_start", "anniversary", "other"
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is still available for public routes if needed, but primary is User Pool
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
