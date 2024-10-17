import colors from "colors";
import dayjs from "dayjs";
import datetimeHelper from "../helpers/datetime.js";
import delayHelper from "../helpers/delay.js";
import fileHelper from "../helpers/file.js";
import generatorHelper from "../helpers/generator.js";
import authService from "../services/auth.js";
import dailyService from "../services/daily.js";
import farmingClass from "../services/farming.js";
import gameService from "../services/game.js";
import inviteClass from "../services/invite.js";
import server from "../services/server.js";
import taskService from "../services/task.js";
import tribeService from "../services/tribe.js";
import userService from "../services/user.js";

const VERSION = "v0.1.6";
// Adjust the delay time for the first loop between threads to avoid spam requests (in seconds)
const DELAY_ACC = 10;
// Set the maximum number of retry attempts for reconnecting when the proxy fails. If the retry exceeds the limit, the account will stop running and log the error to a file.
const MAX_RETRY_PROXY = 20;
// Set the maximum number of retry attempts for login when the login fails. If the retry exceeds the limit, the account will stop running and log the error to a file.
const MAX_RETRY_LOGIN = 20;
// Configure play time for the game to avoid server downtime. Based on Vietnam time (UTC+7)
const TIME_PLAY_GAME = [1, 23];
// Configure countdown to the next run
const IS_SHOW_COUNTDOWN = true;
const countdownList = [];

let database = {};
setInterval(async () => {
  const data = await server.getData();
  if (data) {
    database = data;
    server.checkVersion(VERSION, data);
  }
}, generatorHelper.randomInt(20, 40) * 60 * 1000);

const run = async (user, index) => {
  let countRetryProxy = 0;
  let countRetryLogin = 0;
  await delayHelper.delay((user.index - 1) * DELAY_ACC);
  while (true) {
    // Retrieve data from the server
    if (database?.ref) {
      user.database = database;
    }

    countdownList[index].running = true;
    // Check proxy connection
    let isProxyConnected = false;
    while (!isProxyConnected) {
      const ip = await user.http.checkProxyIP();
      if (ip === -1) {
        user.log.logError(
          "Proxy error, checking proxy connection, will try to reconnect in 30s"
        );
        countRetryProxy++;
        if (countRetryProxy >= MAX_RETRY_PROXY) {
          break;
        } else {
          await delayHelper.delay(30);
        }
      } else {
        countRetryProxy = 0;
        isProxyConnected = true;
      }
    }
    try {
      if (countRetryProxy >= MAX_RETRY_PROXY) {
        const dataLog = `[No ${user.index} _ ID: ${
          user.info.id
        } _ Time: ${dayjs().format(
          "YYYY-MM-DDTHH:mm:ssZ[Z]"
        )}] Proxy connection error - ${user.proxy}`;
        fileHelper.writeLog("log.error.txt", dataLog);
        break;
      }

      if (countRetryLogin >= MAX_RETRY_LOGIN) {
        const dataLog = `[No ${user.index} _ ID: ${
          user.info.id
        } _ Time: ${dayjs().format(
          "YYYY-MM-DDTHH:mm:ssZ[Z]"
        )}] Failed to log in after ${MAX_RETRY_LOGIN} attempts`;
        fileHelper.writeLog("log.error.txt", dataLog);
        break;
      }
    } catch (error) {
      user.log.logError("Failed to log the error");
    }

    // Log into the account
    const login = await authService.handleLogin(user);
    if (!login.status) {
      countRetryLogin++;
      await delayHelper.delay(60);
      continue;
    } else {
      countRetryLogin = 0;
    }

    await dailyService.checkin(user);
    await tribeService.handleTribe(user);
    if (user.database?.skipHandleTask) {
      user.log.log(
        colors.yellow(
          `Temporarily skipping tasks due to server error (will automatically resume when the server is stable)`
        )
      );
    } else {
      await taskService.handleTask(user);
    }

    await inviteClass.handleInvite(user);
    let awaitTime = await farmingClass.handleFarming(
      user,
      login.profile?.farming
    );
    countdownList[index].time = (awaitTime + 1) * 60;
    countdownList[index].created = dayjs().unix();
    const minutesUntilNextGameStart = await gameService.handleGame(
      user,
      login.profile?.playPasses,
      TIME_PLAY_GAME
    );
    if (minutesUntilNextGameStart !== -1) {
      const offset = dayjs().unix() - countdownList[index].created;
      const countdown = countdownList[index].time - offset;
      if (minutesUntilNextGameStart * 60 < countdown) {
        countdownList[index].time = (minutesUntilNextGameStart + 1) * 60;
        countdownList[index].created = dayjs().unix();
      }
    }
    countdownList[index].running = false;
    await delayHelper.delay((awaitTime + 1) * 60);
  }
};

console.log(
  colors.yellow.bold(
    `=============  Tool developed and shared for free by ZuyDD  =============`
  )
);
console.log(
  "Any trading of the tool in any form is not permitted!"
);
console.log(
  `Telegram: ${colors.green(
    "https://t.me/zuydd"
  )}  ___  Facebook: ${colors.blue("https://www.facebook.com/zuy.dd")}`
);
console.log(
  `🚀 Get the latest tools at: 👉 ${colors.gray(
    "https://github.com/zuydd"
  )} 👈`
);
console.log("");
console.log("");

server.checkVersion(VERSION);
server.showNoti();
console.log("");
const users = await userService.loadUser();

for (const [index, user] of users.entries()) {
  countdownList.push({
    running: true,
    time: 480 * 60,
    created: dayjs().unix(),
  });
  run(user, index);
}

if (IS_SHOW_COUNTDOWN && users.length) {
  let isLog = false;
  setInterval(async () => {
    const isPauseAll = !countdownList.some((item) => item.running === true);

    if (isPauseAll) {
      await delayHelper.delay(1);
      if (!isLog) {
        console.log(
          "========================================================================================="
        );
        isLog = true;
      }
      const minTimeCountdown = countdownList.reduce((minItem, currentItem) => {
        // Calculate offset difference
        const currentOffset = dayjs().unix() - currentItem.created;
        const minOffset = dayjs().unix() - minItem.created;
        return currentItem.time - currentOffset < minItem.time - minOffset
          ? currentItem
          : minItem;
      }, countdownList[0]);
      const offset = dayjs().unix() - minTimeCountdown.created;
      const countdown = minTimeCountdown.time - offset;
      process.stdout.write("\x1b[K");
      process.stdout.write(
        colors.white(
          `[${dayjs().format(
            "DD-MM-YYYY HH:mm:ss"
          )}] All threads have finished running, need to wait: ${colors.blue(
            datetimeHelper.formatTime(countdown)
          )}     \r`
        )
      );
    } else {
      isLog = false;
    }
  }, 1000);

  process.on("SIGINT", () => {
    console.log("");
    process.stdout.write("\x1b[K"); // Clear the current line from the cursor to the end of the line
    process.exit(); // Exit the process
  });
}

setInterval(() => {}, 1000); // Keep the script from exiting immediately
