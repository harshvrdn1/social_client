import React, { useEffect, useMemo } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import * as toxicity from "@tensorflow-models/toxicity";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import ChatPage from "./scenes/chatPage";
import { atom, useSetRecoilState } from "recoil";
import { useSelector } from "react-redux";

export const modal = atom({
  key: "modal",
  default: null,
});
export const alertState = atom({
  key: "alertState",
  default: {
    status: false,
    message: "",
  },
});
function App() {
  const mode = useSelector((state) => state.mode);
  const setModal = useSetRecoilState(modal);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await toxicity.load(0.7);
        if (loadedModel) {
          setModal(loadedModel);
          console.log("loadedModel:");
        } else {
          console.log("Model not loaded");
        }
      } catch (error) {
        console.error("Error loading the model:", error);
      }
    };
    loadModel();
  }, [setModal]);

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/home"
              element={isAuth ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
            />
            <Route
              path="/chat"
              element={isAuth ? <ChatPage /> : <Navigate to="/" />}
            />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

// import {
//   ClerkProvider,
//   SignedIn,
//   SignedOut,
//   RedirectToSignIn,
//   SignIn,
//   SignUp,
//   UserButton,
// } from "@clerk/clerk-react";
// import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
// import HomePage from "scenes/homePage";
// import { atom, useSetRecoilState } from "recoil";

// if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key");
// }

// const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
// export const modal = atom({
//   key: "modal",
//   default: null,
// });
// export const alertState = atom({
//   key: "alertState",
//   default: {
//     status: false,
//     message: "",
//   },
// });
// function PublicPage() {
//   return (
//     <>
//       <h1>Public page</h1>
//       <a href="/protected">Go to protected page</a>
//     </>
//   );
// }

// function ProtectedPage() {
//   return (
//     <>
//       <h1>Protected page</h1>
//       <UserButton />
//     </>
//   );
// }

// function ClerkProviderWithRoutes() {
//   const navigate = useNavigate();

//   return (
//     <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => navigate(to)}>
//       <Routes>
//         <Route path="/" element={<PublicPage />} />
//         <Route
//           path="/sign-in/*"
//           element={<SignIn routing="path" path="/sign-in" />}
//         />
//         <Route
//           path="/sign-up/*"
//           element={<SignUp routing="path" path="/sign-up" />}
//         />
//         <Route
//           path="/home"
//           element={
//             <>
//               <SignedIn>
//                 {/* <Route
//                   path="/home"
//                   element={
//                     <SignedIn>
//                     </SignedIn>
//                   }
//                 /> */}
//                 <HomePage />
//                 {/* <ProtectedPage /> */}
//               </SignedIn>
//               <SignedOut>
//                 <RedirectToSignIn />
//               </SignedOut>
//             </>
//           }
//         />
//       </Routes>
//     </ClerkProvider>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <ClerkProviderWithRoutes />
//     </BrowserRouter>
//   );
// }

// export default App;
