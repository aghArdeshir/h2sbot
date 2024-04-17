// needs to be a separate file and loaded before other files that depend on the
// environment variables being set up.

import { config as dotenvConfig } from "dotenv";

dotenvConfig();
