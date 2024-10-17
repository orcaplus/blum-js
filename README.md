Sure! Here’s the translated version of your text:

---

![Blum banner](https://raw.githubusercontent.com/zuydd/image/main/blum.jpeg)

# Auto Blum NodeJS Tool by ZuyDD

**Developed and shared for free by ZuyDD**

<a href="https://www.facebook.com/zuy.dd"><img src="https://raw.githubusercontent.com/zuydd/image/main/facebook.svg" alt="Facebook"></a>
<a href="https://t.me/zuydd"><img src="https://raw.githubusercontent.com/zuydd/image/main/telegram.svg" alt="Telegram"></a>

> [!WARNING]
> Any trading of the tool in any form is not permitted!

## 🛠️ Installation Guide

> Requires NodeJS installed

- Step 1: Download the latest version of the tool [here ⬇️](https://github.com/zuydd/blum/archive/refs/heads/main.zip)
- Step 2: Unzip the tool
- Step 3: In the unzipped tool folder (the folder containing the package.json file), run the command `npm install` to install the supporting libraries.

## 💾 How to Add Account Data

> The tool supports both `user` and `query_id` (query_id is recommended)

> All data you need to enter can be found in files in the 📁 `src/data` folder.

- [users.txt](src/data/users.txt): contains the list of `user` or `query_id` for accounts, one account per line.
- [proxy.txt](src/data/proxy.txt): contains the list of proxies; each line corresponds to the account in the same line in the users.txt file above. Leave blank if not using a proxy.
- [token.json](src/data/token.json): contains the list of tokens generated from `user` or `query_id`. Tokens will be automatically generated when you run the tool.

> Proxy format: http://user:pass@ip:port

## >\_ Commands and Corresponding Functions

| Command            | Function                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `npm run start`    | Used to run farming/claiming, completing tasks, checking in, playing games, claiming invite points, etc. Basically, it does whatever the game requires. |

## 🕹️ Features in the Tool

- Automatically checks in daily
- Automatically joins a tribe to receive an additional 10% reward points
- Automatically completes tasks
- Automatically farms/claims when the time comes
- Automatically plays games
- Claims invite points
- Automatically detects proxies, reconnects when there's an error. If you’re using proxies, add them to the proxy.txt file corresponding to the line with the account you want to run with that proxy. Leave blank or type "skip" for accounts that don’t need a proxy.
- Multi-threaded, can run as many accounts as you want without blocking each other.
- Set game playing times; by default, it can play from 1 AM to 1 PM (Vietnam time UTC+7). You can find the variable `TIME_PLAY_GAME = [1, 13]` to change the playing hours.

> [!WARNING]
>
> - If you encounter login, task completion, or gaming errors, it's due to the Blum server issues, not the tool's fault. Just wait for it to come back to normal.
> - Since the server often has issues between 2 PM - 12 AM, it’s recommended to run the tool for the first time between 4 AM - 12 PM for smoother operation.

## ♾ Multi-threaded Setup

- By default, the tool will run multi-threaded according to the number of accounts you enter, with no additional setup required.
- In the first loop, each account (thread) will run 30 seconds apart to avoid spam requests. You can find the variable `DELAY_ACC = 10` in the [index.js](src/run/index.js) file to adjust as needed.

## ❌ Retry Mode on Errors

- For proxy connection errors, the system will attempt to retry every 30 seconds. You can set the maximum retry limit by finding the variable `MAX_RETRY_PROXY = 20` in the [index.js](src/run/index.js) file to adjust as needed (default is 20). When the retry limit is exceeded, the system will stop auto for that account and log the error in the [log.error.txt](src/data/log.error.txt) file.
- For failed login errors, the system will attempt to retry every 60 seconds. You can set the maximum retry limit by finding the variable `MAX_RETRY_LOGIN = 20` in the [index.js](src/run/index.js) file to adjust as needed (default is 20). When the retry limit is exceeded, the system will stop auto for that account and log the error in the [log.error.txt](src/data/log.error.txt) file.

## 🔄 Update History

> When updating to a new version, simply copy the 📁 [data](src/data) folder from the old version and overwrite it in the new version to run without needing to retrieve the data again.

> Latest version: `v0.1.6`

<details>
<summary>v0.1.6 - 📅 16/10/2024</summary>
  
- Fixed gaming issues
- Added dog collection (DOGS) while playing
</details>
<details>
<summary>v0.1.5 - 📅 12/10/2024</summary>
  
- Temporarily removed game playing, will fix later
</details>
<details>
<summary>v0.1.4 - 📅 25/09/2024</summary>
  
- Temporarily removed task completion due to server errors (will automatically reopen when the server stabilizes)
</details>
<details>
<summary>v0.1.3 - 📅 19/09/2024</summary>
  
- Fixed task completion errors
</details>
<details>
<summary>v0.1.2 - 📅 18/09/2024</summary>
  
- Added tasks for X Empire
</details>
<details>
<summary>v0.1.1 - 📅 14/09/2024</summary>
  
- Fixed continuous loop errors
- Added system notifications and version checks
- Added time limits for game playing to avoid lag times; by default, can only play from 1 AM to 1 PM (Vietnam time UTC+7).
</details>
<details>
<summary>v0.1.0 - 📅 14/09/2024</summary>
  
- Added weekly task completion
</details>
<details>
<summary>v0.0.9 - 📅 13/09/2024</summary>
  
- Fixed GitHub server request spamming errors
</details>
<details>
<summary>v0.0.8 - 📅 13/09/2024</summary>
  
- Fixed data retrieval issues from the server
</details>
<details>
<summary>v0.0.7 - 📅 13/09/2024</summary>
  
- Fixed failed task listing issues
- Supported Promo task completion
- Added countdown to the next run
- Automatically retrieves answer data from the server every 20-40 minutes
</details>
<details>
<summary>v0.0.6 - 📅 11/09/2024</summary>
  
- Added automatic completion of tasks requiring answers (due to Blum server instability, the first attempt may fail; just wait for it to come back online)
- Fixed check-in functionality to display correct status and rewards during check-in
- Fixed automatic claim for invite points
- Fixed failed task listing issues
</details>
<details>
<summary>v0.0.5 - 📅 08/09/2024</summary>
  
- Added retry limit mechanism for proxy/login errors
- Logged errors into the log file when retries exceed the set number for easier tracking when running multiple accounts
- Accurately updated game tickets after check-in
</details>
<details>
<summary>v0.0.4 - 📅 07/09/2024</summary>
  
- Updated task data, fixed task completion issues
</details>
<details>
<summary>v0.0.3 - 📅 05/09/2024</summary>
  
- Changed login API
</details>
<details>
<summary>v0.0.2 - 📅 02/09/2024</summary>
  
- Adjusted game point rewards to match reality (from 180 - 200)
</details>
<details>
<summary>v0.0.1 - 📅 02/09/2024</summary>
  
- Shared the tool with the community
</details>

## 🎁 Donate

We are happy to share scripts and source code resources for free with the airdrop community. If you find our tools and documentation useful and want to support us in continuing to develop and maintain these projects, you can donate to support us.

Every contribution will help us maintain the quality of our services and continue providing valuable resources for the airdrop community. We sincerely thank you for your support!

Much love 😘😘😘

<div style="display: flex; gap: 20px;">
  <img src="https://raw.githubusercontent.com/zuydd/image/main/qr-momo.png" alt="QR Momo" height="340" />
  <img src="https://raw.githubusercontent.com/zuydd/image/main/qr-binance.jpg" alt="QR Binance" height="340" />
</div>

---
