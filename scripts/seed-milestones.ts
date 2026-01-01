import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const milestones = [
  {
    title: "First Date",
    date: "2025-06-29",
    icon: "heart",
    isReached: true,
    order: 1,
    category: "other"
  },
  {
    title: "First Day",
    date: "2025-07-01",
    icon: "check",
    isReached: true,
    order: 2,
    category: "relationship_start"
  },
  {
    title: "1 Month",
    date: "2025-08-01",
    icon: "check",
    isReached: true,
    order: 3,
    category: "anniversary"
  },
  {
    title: "100 Days",
    date: "2025-10-09",
    icon: "check",
    isReached: true,
    order: 4,
    category: "other"
  },
  {
    title: "6 Months",
    date: "2026-01-01",
    icon: "heart",
    isReached: true,
    order: 5,
    category: "anniversary"
  },
  {
    title: "1 Year",
    date: "2026-07-01",
    icon: "lock",
    isReached: false,
    order: 6,
    category: "anniversary"
  }
];

async function seed() {
  console.log("Seeding milestones...");
  for (const m of milestones) {
    try {
      await client.models.Milestone.create(m);
      console.log(`Created milestone: ${m.title}`);
    } catch (e) {
      console.error(`Error creating ${m.title}:`, e);
    }
  }
  console.log("Seeding complete!");
}

// Note: This script needs to be run in a browser environment or with proper auth
// Since I can't easily run it in the terminal with full auth easily without a session,
// I'll provide this as a reference or a one-time component.
