import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pvp, setPosts } from "state";
import { v4 } from "uuid";
import { storage } from "../../firebase.js";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { alertState, modal } from "App.js";
import data from "../../assests/data.json";
import loadinganimation from "../../assests/loadinganimation.gif";
import axios from "axios";
const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [showOverLay, setShowOverlay] = useState(false);
  const [post, setPost] = useState("");
  const [showOverLayMessage, setShowOverLayMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pvpmodel, setpvpmodel] = useState(false);
  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;
  const loadModal = useRecoilValue(modal);
  const setShowAlert = useSetRecoilState(alertState);
  const pvpvalue = useRecoilValue(pvp);
  const resetState = useResetRecoilState(pvp);

  const containsSimilarWord = async (sentence, wordArray) => {
    const sentenceWords = sentence.split(/\s+/);
    return sentenceWords.some((sentenceWord) => {
      return wordArray.some((arrayWord) => {
        return sentenceWord.toLowerCase() === arrayWord.toLowerCase();
      });
    });
  };
  const evaluate = async () => {
    const similar = await containsSimilarWord(post, data);
    if (similar) return true;

    if (loadModal) {
      setShowOverLayMessage("fetching...");
      console.log("evaluating....");
      const evaluation = await loadModal.classify([post]);
      setShowOverLayMessage("Evaluating...");

      for (const result of evaluation) {
        if (result.results[0].match) {
          return true;
        }
      }
      setShowOverLayMessage("Text analyze Complete...");
      return false;
    } else {
      return false;
    }
  };
  const handlePost = async () => {
    setLoading(true);
    setShowOverlay(true);
    const evaluation = await evaluate();
    console.log(evaluation);
    if (evaluation) {
      setPost("");
      setShowAlert({
        status: true,
        message: "toxic post",
      });
      setImage(null);
      setLoading(false);
      setShowOverlay(false);
      return;
    }
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    formData.append("to_id", pvpvalue.id);
    formData.append("pvp", pvpvalue.pvp);
    formData.append("to_user", pvpvalue.to);
    if (image) {
      if (image.type.includes("image")) {
        setShowOverLayMessage("Image Fetching...");
      } else {
        setShowOverLayMessage("Video Fetching...");
      }
      console.log(image);
      const imageRef = ref(storage, `images/${image.name + v4()}`);
      try {
        const snapshot = await uploadBytes(imageRef, image);
        const downloadURL = await getDownloadURL(snapshot.ref);

        if (image.type.includes("video")) {
          try {
            setShowOverLayMessage("Video Analyzing...");

            const res = await axios.post(
              "https://toxic-clzt.onrender.com/video_moderation",
              {
                video_url: downloadURL,
              }
            );
            if (res.data.details?.summary?.reject_reason) {
              // Return from the function if video is rejected
              setImage(null);
              setPost("");
              setShowAlert({
                status: true,
                message: "Video Contain Toxicity ",
              });
              setLoading(false);
              setShowOverlay(false);
              return;
            } else setShowOverLayMessage("Video Analyzing complete...");
          } catch (err) {
            setLoading(false);
            setShowOverlay(false);
            return;
          }
        } else {
          try {
            setShowOverLayMessage("Image Analyzing...");
            const res = await axios.post(
              "https://toxic-clzt.onrender.com/check_moderation",
              {
                image_url: downloadURL,
              }
            );
            if (res?.data?.status === "Image Rejected") {
              // Return from the function if image is rejected
              setImage(null);
              setPost("");
              setShowAlert({
                status: true,
                message: "Image Contain Toxicity ",
              });
              setLoading(false);
              setShowOverlay(false);
              return;
            } else setShowOverLayMessage("Video Analyzing complete ...");
          } catch (err) {
            setLoading(false);
            setShowOverlay(false);
            return;
          }
        }

        formData.append("picture", downloadURL);
        formData.append("picturePath", downloadURL);
        if (image.type.includes("image")) {
          formData.append("mediaType", "image");
        } else if (image.type.includes("video")) {
          formData.append("mediaType", "video");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setLoading(false);
        setShowOverlay(false);
        return;
      }
    }
    setShowOverLayMessage("Uploading...");
    const response = await fetch(`http://localhost:3001/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const posts = await response.json();
    setShowOverLayMessage("Completed ✅...");
    dispatch(setPosts({ posts }));
    setImage(null);
    setPost("");
    setShowOverlay(false);
    setLoading(false);
  };

  return (
    <WidgetWrapper style={{ position: "relative" }}>
      {showOverLay && <Overlay showOverLayMessage={showOverLayMessage} />}
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={loading ? "Loading / Evaluating" : post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
        <Button
          style={{ display: "flex", padding: 2 }}
          onClick={() => setpvpmodel(!pvpmodel)}
        >
          {pvpvalue.to || "PUBLIC"}
          {pvpvalue.pvp === "private" ? (
            <button
              style={{ background: "transparent", border: "none" }}
              onClick={resetState}
            >
              <CloseIcon style={{ color: "#485566", cursor: "pointer" }} />
            </button>
          ) : (
            ""
          )}
        </Button>
      </FlexBetween>
      {pvpmodel ? <PVPmodel /> : ""}
      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png,.mp4,.mov"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add media Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Media
          </Typography>
        </FlexBetween>

        {isNonMobileScreens ? (
          <></>
        ) : (
          <FlexBetween gap="0.25rem">
            <MoreHorizOutlined sx={{ color: mediumMain }} />
          </FlexBetween>
        )}
        <Button
          disabled={loading === false && post === ""}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          {loading ? "Loading" : "POST"}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;

const PVPmodel = () => {
  const user = useSelector((state) => state.user);
  const setpvp = useSetRecoilState(pvp);
  console.log(setpvp);
  return (
    <>
      <List lg={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {user.friends &&
          user.friends.map((friend) => (
            <ListItem
              onClick={() =>
                setpvp({
                  id: friend._id,
                  pvp: "private",
                  to: friend.firstName,
                })
              }
            >
              <ListItemAvatar>
                <Avatar alt={friend.firstName} src={friend.picturePath} />
              </ListItemAvatar>
              <ListItemText
                primary={`${friend.firstName} ${friend.lastName}`}
              />
            </ListItem>
          ))}
      </List>
    </>
  );
};

const Overlay = ({ showOverLayMessage }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 15,
        top: 0,
        right: 0,
        borderRadius: "15px",
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {showOverLayMessage}
    </div>
  );
};
