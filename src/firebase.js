import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBLUvE72h7Mam1XvCkD5tMTRdQs9wtVHkY",
  authDomain: "socialvrdn.firebaseapp.com",
  projectId: "socialvrdn",
  storageBucket: "socialvrdn.appspot.com",
  messagingSenderId: "435238514055",
  appId: "1:435238514055:web:f241d4849c13a3dac0b722",
  measurementId: "G-3MXZX8SK9Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage();
export const sendMessageToUserChat = async (
  senderId,
  receiverId,
  senderName,
  message
) => {
  try {
    const OneToOne =
      senderId > receiverId
        ? senderId + "_" + receiverId
        : receiverId + "_" + senderId;

    const userChatsRef = doc(db, "userchats", OneToOne);

    try {
      await setDoc(userChatsRef, {}, { merge: true }); // Create the document if it doesn't exist
      await updateDoc(userChatsRef, {
        messages: arrayUnion({
          message: message,
          senderId: senderId,
          date: Timestamp.now(),
          senderName: senderName,
        }),
      });
      console.log("Message sent successfully!");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const getChats = (senderId, receiverId) => {
  try {
    const OneToOne =
      senderId > receiverId
        ? senderId + "_" + receiverId
        : receiverId + "_" + senderId;
    // const userChatsRef = collection(db, "userchats");
    // const q = query(userChatsRef, where("OneToOne", "==", OneToOne));
    const unsub = onSnapshot(doc(db, "userchats", OneToOne), (doc) => {
      const data = doc.data();
      console.log(data);
    });
    return unsub;
  } catch (error) {
    console.error("Error getting user chats:", error);
    return [];
  }
};

export const analytics = getAnalytics(app);
