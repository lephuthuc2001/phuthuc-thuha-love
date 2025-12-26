"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

try {
  console.log("Configuring Amplify with outputs:", outputs ? "Found" : "Missing");
  Amplify.configure(outputs);
} catch (error) {
  console.error("Failed to configure Amplify:", error);
}

export default function ConfigureAmplifyClientSide() {
  return null;
}
