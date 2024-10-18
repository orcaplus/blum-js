import colors from "colors";

class InviteClass {
  constructor() {}

  async getBalanceInvite(user) {
    try {
      const { data } = await user.http.get(3, "friends/balance");
      if (data) {
        return data;
      } else {
        throw new Error(
          `Failed to get invite balance information: ${data.message}`
        );
      }
    } catch (error) {
      user.log.logError(
        `Failed to get invite balance information: ${error.response?.data?.message}`
      );
      return 0;
    }
  }

  async claimInvite(user) {
    try {
      const { data } = await user.http.post(3, "friends/claim", {});
      if (data) {
        user.log.log(
          `Claim referral points successfully, received: ${colors.green(
            data?.claimBalance + user.currency
          )}`
        );
        return true;
      } else {
        throw new Error(`Referral Point Claim Failed: ${data.message}`);
      }
    } catch (error) {
      user.log.logError(
        `Referral Point Claim Failed: ${error.response?.data?.message}`
      );
      return false;
    }
  }

  async handleInvite(user) {
    const balance = await this.getBalanceInvite(user);
    if (balance.amountForClaim > 0 && balance.canClaim) {
      await this.claimInvite(user);
    }
  }
}

const inviteClass = new InviteClass();
export default inviteClass;
