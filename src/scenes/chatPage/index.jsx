import React, { useEffect, useRef, useState } from "react";
import Navbar from "scenes/navbar";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { Button, TextField } from "@mui/material";
import { db, sendMessageToUserChat } from "../../firebase.js";
import { doc, onSnapshot } from "firebase/firestore";
import animatedhand from "../../assests/animated hand.gif";
const ChatBody = ({ user, selected }) => {
  const [text, setText] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const sendMessage = async (user, selected) => {
    setLoading(true);
    const senderId = user._id;
    const senderName = user.firstName + " " + user.lastName;
    if (text === "") return;
    try {
      await sendMessageToUserChat(senderId, selected, senderName, text);
      setText("");
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(
        db,
        "userchats",
        `${
          user._id > selected
            ? `${user._id}_${selected}`
            : `${selected}_${user._id}`
        }`
      ),
      (doc) => {
        if (doc.exists()) {
          setData(doc.data().messages);
          if (containerRef.current) {
            containerRef.current.scrollTop =
              containerRef.current.scrollHeight - 250;
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user._id, selected]);

  if (!selected) {
    return (
      <Grid
        item
        xs={10}
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          padding: 8,
          justifyContent: "center",
          alignItems: "center", // Updated to alignItems
        }}
      >
        <img src={animatedhand} alt="err" />
      </Grid>
    );
  }
  return (
    <Grid
      item
      xs={10}
      style={{
        height: "100%",
        width: "100%",
        padding: 8,
        background: "white",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          ref={containerRef}
          style={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            paddingBottom: 130,
          }}
        >
          {data &&
            data.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent:
                    message.senderId === user._id ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                {message.senderId !== user._id && (
                  <div
                    style={{
                      marginRight: "8px",
                      marginLeft: "8px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {message.senderName}
                  </div>
                )}
                <Paper
                  elevation={3}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    background:
                      message.senderId === user._id ? "#f0f8ff" : "#ffffff",
                  }}
                >
                  {message.message}
                </Paper>
              </div>
            ))}
        </div>

        <TextField
          variant="outlined"
          placeholder="Type a message"
          value={text}
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: "white",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(user, selected);
            }
          }}
          InputProps={{
            endAdornment: (
              <Button
                style={{ position: "fixed", bottom: 10, right: 10 }}
                variant="contained"
                color="primary"
                onClick={() => sendMessage(user, selected)}
              >
                {loading ? "Loading..." : "send"}
              </Button>
            ),
          }}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </Grid>
  );
};

const Sidebar = ({ setSelected, selected, friends }) => {
  return (
    <Grid
      container
      direction="column"
      justify="space-between"
      style={{ height: "100%", overflowY: "auto", background: "#f0f0f0" }}
      item
      xs={2}
      component={Paper}
      square
    >
      <List>
        {friends.map((friend) => (
          <ListItem
            key={friend.id}
            style={{
              background: selected !== friend._id ? "" : "#c0c0c0",
              cursor: "pointer",
            }}
            onClick={() => setSelected(friend._id)}
          >
            <ListItemText primary={friend.firstName + " " + friend.lastName} />
          </ListItem>
        ))}
      </List>
    </Grid>
  );
};

const Index = () => {
  const [selected, setSelected] = useState(null);
  const user = useSelector((state) => state.user);
  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <Grid container style={{ height: "100vh" }}>
        <Sidebar
          setSelected={setSelected}
          selected={selected}
          friends={user.friends}
        />
        <ChatBody user={user} selected={selected} />
      </Grid>
    </div>
  );
};

export default Index;
