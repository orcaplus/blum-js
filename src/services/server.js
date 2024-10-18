import axios from "axios";
import colors from "colors";

class Server {
  constructor() {}

  async getData() {
    try {
      const endpointDatabase =
        "https://raw.githubusercontent.com/zuydd/database/main/blum.json";
      const { data } = await axios.get(endpointDatabase);
      return data;
    } catch (error) {
      console.log(colors.red("Failed to get zuydd server data"));
      return null;
    }
  }

  async showNoti() {
    const database = await this.getData();
    if (database && database.noti) {
      console.log(colors.blue("📢 System Notification"));
      console.log(database.noti);
      console.log("");
    }
  }

  async checkVersion(curentVersion, database = null) {
    if (!database) {
      database = await this.getData();
    }

    if (database && curentVersion !== database.ver) {
      console.log(
        colors.yellow(
          `🚀 New version available ${colors.blue(
            database.ver
          )}, Download here 👉 ${colors.blue(
            "https://github.com/zuydd/blum"
          )}`
        )
      );
      console.log("");
    }
  }
}

const server = new Server();
export default server;
