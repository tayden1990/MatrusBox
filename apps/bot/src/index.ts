import dotenv from "dotenv";
import { MatrusBot } from "./bot";

// Load environment variables
dotenv.config();

async function main() {
  try {
    const bot = new MatrusBot();
    await bot.start();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

main();
