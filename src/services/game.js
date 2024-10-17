import axios from "axios";
import colors from "colors";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import authService from "./auth.js";

dayjs.extend(utc);
dayjs.extend(timezone);

class GameService {
  constructor() {}

  async playGame(user, delay) {
    try {
      const { data } = await user.http.post(5, "game/play", {});

      if (data) {
        user.log.log(
          `Starting game, ending and receiving reward after: ${colors.blue(
            delay + "s"
          )}`
        );
        return data.gameId;
      } else {
        throw new Error(`Game play failed: ${data.message}`);
      }
    } catch (error) {
      if (error.response?.data?.message === "not enough play passes") {
        return 2; // Not enough play passes
      } else {
        user.log.logError(
          `Game play failed: ${error.response?.data?.message}`
        );
      }
      return null;
    }
  }

  async claimGame(user, gameId, eligibleDogs) {
    let points = generatorHelper.randomInt(180, 220);
    let dogs = 0;
    if (eligibleDogs) {
      points = generatorHelper.randomInt(90, 110);
      dogs = generatorHelper.randomInt(15, 20) * 5;
    }
    const payload = await this.createPlayload(user, gameId, points, dogs);

    if (!payload) return;

    const body = { payload };
    try {
      const { data } = await user.http.post(5, "game/claim", body);
      if (data) {
        user.log.log(
          `Game finished, reward: ${colors.green(
            points + user.currency
          )}${eligibleDogs ? ` - ${dogs} 🦴` : ""}`
        );
        return true;
      } else {
        throw new Error(`Claim game reward failed: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Claim game reward failed: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async createPlayload(user, gameId, points, dogs) {
    const servers =
      user?.database?.payloadServer?.filter((server) => server.status === 1) ||
      [];
    let server = "zuydd";
    if (servers.length) {
      const index = generatorHelper.randomInt(0, servers.length - 1);
      server = servers[index];
    }
    try {
      const endpointPayload = `https://${server.id}.vercel.app/api/blum`;
      const { data } = await axios.post(endpointPayload, {
        game_id: gameId,
        points,
        dogs,
      });

      if (data.payload) return data.payload;
      throw new Error(`Payload creation failed: ${data?.error}`);
    } catch (error) {
      console.log(colors.red(error.response.data.error));
      return null;
    }
  }

  async eligibilityDogs(user) {
    try {
      const { data } = await user.http.get(5, "game/eligibility/dogs_drop");
      return data.eligible;
    } catch (error) {
      return false;
    }
  }

  checkTimePlayGame(time) {
    // Get the current time in Vietnam timezone (UTC+7)
    const now = dayjs().tz("Asia/Ho_Chi_Minh");

    // Create a dayjs object for start and end times based on the current day
    const startTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[0])
      .minute(0)
      .second(0);
    const endTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[1])
      .minute(0)
      .second(0);

    // Adjust if the end time is before midnight
    if (endTime.isBefore(startTime)) {
      endTime.add(1, "day");
    }

    // Check if the current time is within the specified time range
    return now.isAfter(startTime) && now.isBefore(endTime);
  }

  getMinutesUntilNextStart(time) {
    // Get the current time in Vietnam timezone (UTC+7)
    const now = dayjs().tz("Asia/Ho_Chi_Minh");

    // Create a dayjs object for the next start time
    let nextStartTime = dayjs()
      .tz("Asia/Ho_Chi_Minh")
      .hour(time[0])
      .minute(0)
      .second(0);

    // If current time is past the start time, set the next start time to tomorrow
    if (now.isAfter(nextStartTime)) {
      nextStartTime = nextStartTime.add(1, "day");
    }

    // Calculate minutes until the next start time
    return nextStartTime.diff(now, "minute");
  }

  async handleGame(user, playPasses, timePlayGame) {
    const isInTimeRange = this.checkTimePlayGame(timePlayGame);
    if (isInTimeRange) {
      const profile = await authService.getProfile(user);
      if (profile) playPasses = profile?.playPasses;
      const eligibleDogs = await this.eligibilityDogs(user);
      const textDropDogs =
        (eligibleDogs ? "can" : "cannot") + " pick up DOGS 🦴";
      user.log.log(
        `Remaining ${colors.blue(playPasses + " passes")} to play the game ${colors.magenta(
          `[${textDropDogs}]`
        )}`
      );
      let gameCount = playPasses || 0;
      let errorCount = 0;
      while (gameCount > 0) {
        if (errorCount > 20) {
          gameCount = 0;
          continue;
        }
        await delayHelper.delay(2);
        const delay = 30 + generatorHelper.randomInt(5, 10);
        const gameId = await this.playGame(user, delay);
        if (gameId === 2) {
          gameCount = 0;
          continue;
        }
        if (gameId) {
          errorCount = 0;

          await delayHelper.delay(delay);
          const statusClaim = await this.claimGame(user, gameId, eligibleDogs);
          if (statusClaim) gameCount--;
        } else {
          errorCount++;
        }
      }
      if (playPasses > 0)
        user.log.log(colors.magenta("All game passes have been used"));
      return -1;
    } else {
      const minutesUntilNextStart = this.getMinutesUntilNextStart(timePlayGame);
      user.log.log(
        colors.yellow(
          `Cannot play the game outside the time range from ${timePlayGame[0]}-${
            timePlayGame[1]
          } hours, next play after: ${colors.blue(
            minutesUntilNextStart + " minutes"
          )}`
        )
      );
      return minutesUntilNextStart;
    }
  }
}

const gameService = new GameService();
export default gameService;
