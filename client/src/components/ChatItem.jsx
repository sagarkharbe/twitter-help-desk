import React from "react";
import { ListItem, Avatar } from "@material-ui/core";
import moment from "moment";

export default function ChatItem(props) {
  const { style, item } = props;
  return (
    <div
      style={{
        marginLeft: style.marginLeft,
        display: "flex",
        flexDirection: "row"
      }}
    >
      <Avatar alt={item.user.name} src={item.user.profile_image_url} />
      <ListItem
        style={{
          marginLeft: "1%",
          marginBottom: "2%",
          width: "75%",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#d3d3d3",
          borderRadius: 20,
          backgroundColor: style.backgroundColor
        }}
      >
        <span>
          <b>{item.user.name}</b> <br />
          <p
            style={{
              fontSize: "1em",
              marginRight: "5px"
            }}
          >
            {item.text}
          </p>
          <p style={{ fontSize: "0.8em" }}>
            {moment(item.created_at).fromNow()}
          </p>
        </span>
      </ListItem>
    </div>
  );
}