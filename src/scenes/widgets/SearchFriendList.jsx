import { useTheme } from "@emotion/react";
import { Search } from "@mui/icons-material";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import React, { useState } from "react";
import axios from "axios";
import Friend from "components/Friend";
const SearchFriendList = () => {
  const { palette } = useTheme();
  const theme = useTheme();
  const [searchterm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const neutralLight = theme.palette.neutral.light;
  const handleSearch = async () => {
    try {
      const data = await axios.get(
        `http://localhost:3001/users/search/${searchterm}`
      );
      setData(data.data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Seach Friend
      </Typography>
      <FlexBetween
        backgroundColor={neutralLight}
        borderRadius="9px"
        gap="3rem"
        padding="0.1rem 1.5rem"
      >
        <InputBase
          placeholder="Search..."
          style={{ position: "relative" }}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSearch() : "")}
        />
        <IconButton onClick={handleSearch}>
          <Search />
        </IconButton>
      </FlexBetween>
      <Box m="2rem 0" />
      {data.map((value, index) => (
        <div key={index}>
          <Box m="1rem 0" />
          <Friend
            friendId={value._id}
            name={`${value.firstName} ${value.lastName}`}
            userPicturePath={value.picturePath}
          />
        </div>
      ))}
    </WidgetWrapper>
  );
};

export default SearchFriendList;
