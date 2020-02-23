const twitter = require("../lib/twitter");

module.exports = {
  getUserDetails: async function(req, res, next) {
    const { user } = req;
    const { data } = await twitter(
      user.oauth_token,
      user.oauth_token_secret
    ).getUserDetails();
    const { name, location, description, screen_name } = data;
    let userInfo = {
      name,
      location,
      description,
      screen_name
    };
    return res.json(userInfo);
  },

  getMentionedTweets: async function(req, res, next) {
    try {
      const { user } = req;
      const { data } = await twitter(
        user.oauth_token,
        user.oauth_token_secret
      ).mentionedTweets();
      return res.json(data);
    } catch (err) {
      console.log("ERROR AT GET_TWEETS - ", err);
      next();
    }
  },

  postReplies: async function(req, res, next) {
    try {
      const { user } = req;
      const { status, inReplyToStatusId } = req.body;
      const { data } = await twitter(
        user.oauth_token,
        user.oauth_token_secret
      ).postReplies({ in_reply_to_status_id: inReplyToStatusId, status });
      return res.json(data);
    } catch (err) {
      console.log("ERROR AT POST REPLY - ", err);
      next();
    }
  }
};