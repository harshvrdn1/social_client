import { Box, Alert, CircularProgress, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
// import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import { useRecoilState, useRecoilValue } from "recoil";
import { alertState, modal } from "App";
import SearchFriendList from "scenes/widgets/SearchFriendList";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  console.log(_id, picturePath);
  const [showAlert, setShowAlert] = useRecoilState(alertState);
  const loadModal = useRecoilValue(modal);

  return (
    <Box>
      {!loadModal && !loadModal ? (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            zIndex: 5,
            background: "#00000085",
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        </div>
      ) : (
        ""
      )}

      <Navbar />
      {showAlert.status && (
        <Alert
          // style={{ position: "fixed", top: 0 }}
          severity="error"
          onClose={() =>
            setShowAlert({
              status: false,
              message: "",
            })
          }
        >
          {showAlert.message}
        </Alert>
      )}
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box>
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
          maxHeight="calc(100vh - 64px)" // Adjust 64px based on your Navbar's height
          // style={{ paddingBottom: 12 }}
        >
          <MyPostWidget picturePath={picturePath} />
          <PostsWidget userId={_id} />
        </Box>
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <FriendListWidget userId={_id} />
            <Box m="2rem 0" />

            <SearchFriendList />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
