import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import {
  Timestamp,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { alertState, modal } from "App.js";
const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  pvp,
  to_user,
  to_id,
  mediaType,
}) => {
  const loadModal = useRecoilValue(modal);
  const setShowAlert = useSetRecoilState(alertState);
  const [isComments, setIsComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const user = useSelector((state) => state.user);
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;
  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const evaluate = async () => {
    if (loadModal) {
      console.log("evaluating....");
      const evaluation = await loadModal.classify([commentMsg]);
      for (const result of evaluation) {
        if (result.results[0].match) {
          return true;
        }
      }
      console.log("Done evaluation");
      return false;
    } else {
      console.log("something went wrong");
      return false;
    }
  };
  const setComment = async (usr) => {
    try {
      setIsLoading(true);
      const evaluationResult = await evaluate();
      if (evaluationResult) {
        setCommentMsg("");
        setShowAlert({
          status: true,
          message: "you comment contain toxicity",
        });
        setIsLoading(false);
        return;
      }
      await setDoc(doc(db, "comments", postId), {}, { merge: true });
      await updateDoc(doc(db, "comments", postId), {
        comments: arrayUnion({
          message: commentMsg,
          postId: postId,
          senderId: postUserId,
          date: Timestamp.now(),
          senderName: `${user.firstName} ${user.lastName}`,
          userPicturePath: user.picturePath,
        }),
      });
      setCommentMsg("");
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setCommentMsg("");
    }
  };
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "comments", postId), (doc) => {
      if (doc.exists()) {
        setData(doc.data().comments);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [postId]);
  return (
    <WidgetWrapper m="2rem 0" style={{ position: "relative" }}>
      {pvp === "private" ? (
        <>
          <FlexBetween>
            <Box>
              {to_id === user._id ? (
                ""
              ) : (
                <>
                  to - <strong>{to_user}</strong>
                </>
              )}
            </Box>
            <Chip label={pvp} />
          </FlexBetween>
          <Box m={3} />
        </>
      ) : (
        ""
      )}

      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && mediaType === "image" && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={picturePath}
        />
      )}
      {picturePath && mediaType === "video" && (
        <video
          controls
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={picturePath}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton
              onClick={() => {
                setIsComments(!isComments);
              }}
            >
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{data?.length}</Typography>
          </FlexBetween>
        </FlexBetween>
      </FlexBetween>
      {isComments && (
        <>
          <Box
            sx={{
              width: 500,
              maxWidth: "100%",
            }}
          >
            <TextField
              fullWidth
              label="Comment"
              id="fullWidth"
              value={isLoading ? "Loading..." : commentMsg}
              onChange={(e) => setCommentMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setComment(user);
                }
              }}
            />
          </Box>
          <List
            style={{
              maxHeight: "50vh",
              overflowY: "scroll",
            }}
            id="style-2"
          >
            {data &&
              data.map((comment, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Avatar
                      alt={comment.senderName}
                      src={comment.userPicturePath}
                    >
                      {comment.senderName.charAt(0)}
                    </Avatar>
                    <ListItem
                      alignItems="flex-start"
                      sx={{ marginLeft: "16px" }}
                    >
                      <ListItemText
                        primary={comment.senderName}
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {comment.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </div>
                );
              })}
          </List>
        </>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
