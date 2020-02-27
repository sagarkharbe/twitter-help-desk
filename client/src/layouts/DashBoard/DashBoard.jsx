import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import api from "../../shared/customAxios";
import { apiUrl } from "../../shared/vars";
import { Grid, Paper } from "@material-ui/core";
import { observer } from "mobx-react";
import { appStore } from "../../store/appStore";
import Header from "../../components/Header/Header";
import { withRouter } from "react-router-dom";
import ReplyBox from "../../components/ReplyBox/ReplyBox";
import TweetList from "../../components/Tweets/TweetList";
import ChatList from "../../components/Chats/ChatList";
import InfoColumn from "../../components/Information/InfoColumn";

class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      user: {},
      tweets: [],
      userTweets: [],
      selectedTweet: null,
      selectedIndex: null,
      replies: {},
      replyButtonDisabled: false,
      reply: ""
    };
  }

  getTweets = async () => {
    return await api.get(`${apiUrl}/api/twitter/tweets`);
  };

  getUserTweets = async () => {
    return await api.get(`${apiUrl}/api/twitter/user/tweets`);
  };
  componentDidMount() {
    this.setState({ isLoading: true });
    this.init();
  }

  init = async () => {
    const user = appStore.user
      ? appStore.user
      : await api.get(`${apiUrl}/api/twitter/self`);
    const tweets = await this.getTweets();
    console.log(typeof tweets);
    this.setState(
      {
        isLoading: false,
        user,
        tweets
      },
      () => this.initSockets()
    );
  };

  initSockets = async () => {
    const { user } = this.state;
    const socket = socketIOClient(apiUrl);
    socket.on("connect", async () => {
      console.log("Socket Connected!");
      const k = await api.post(`${apiUrl}/setSearchTerm`, {
        term: user.screen_name
      });
      socket.on("tweets", tweet => {
        if (!this.state.tweets.some(o => o.id_str === tweet.id_str))
          this.setState({ tweets: [tweet].concat(this.state.tweets) });
      });
    });
    socket.on("disconnect", () => {
      socket.off("tweets");
      socket.removeAllListeners("tweets");
      console.log("Socket Disconnected!");
    });
  };

  handleSelected = (index, tweet) => {
    this.setState({
      selectedIndex: index,
      selectedTweet: tweet
    });
  };

  handleReply = str => {
    this.setState({
      reply: str
    });
  };

  handleInputChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  postReplies = async query => {
    if (this.state.selectedTweet === null) {
      window.alert("Please select a tweet to reply");
      return;
    }
    this.setState({ replyButtonDisabled: true });
    const { data } = await api.post(
      `${apiUrl}/api/twitter/postReplies`,
      JSON.stringify({
        inReplyToStatusId: query.selectedTweet.id_str,
        status: query.reply
      })
    );
    const replies = { ...query.replies };

    if (!replies[query.selectedTweet.id]) {
      replies[query.selectedTweet.id] = [];
    }
    replies[query.selectedTweet.id].push(data);

    this.setState({
      reply: "@" + query.selectedTweet.user.screen_name + " ",
      replies,
      replyButtonDisabled: false
    });
  };

  logout = async () => {
    window.localStorage.clear();
    appStore.changeLoginState(false, null, "");
    //wait for appStore to change login state & localstorage to clear
    setTimeout(() => {
      this.props.history.push("/");
    }, 100);
  };

  render() {
    const {
      replies,
      selectedIndex,
      selectedTweet,
      reply,
      tweets,
      isLoading,
      replyButtonDisabled
    } = this.state;
    return (
      <div
        style={{
          height: "100%",
          width: "100%"
        }}
      >
        <Header logout={this.logout} />

        <Grid container spacing={0}>
          <Grid item xs={3}>
            <TweetList
              isLoading={isLoading}
              tweets={tweets}
              selectedIndex={selectedIndex}
              handleReply={this.handleReply}
              handleSelected={this.handleSelected}
            ></TweetList>
          </Grid>

          <Grid item xs={6}>
            <Paper
              style={{
                height: "92vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#EBEBEB"
              }}
            >
              <Grid item xs={12}>
                <ChatList
                  isLoading={isLoading}
                  selectedTweet={selectedTweet}
                  replies={replies}
                ></ChatList>
              </Grid>

              <Grid item xs={12}>
                <ReplyBox
                  reply={reply}
                  replyButtonDisabled={replyButtonDisabled}
                  handleInputChange={this.handleInputChange}
                  postReplies={() => {
                    this.postReplies({ reply, selectedTweet, replies });
                  }}
                ></ReplyBox>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={3}>
            <InfoColumn selectedTweet={selectedTweet} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default observer(withRouter(DashBoard));