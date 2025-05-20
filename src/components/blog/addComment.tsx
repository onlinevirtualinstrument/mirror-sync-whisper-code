import { db } from "@/utils/blog/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addComment = async (blogId: string, text: string, name = "Anonymous") => {
  const commentRef = collection(db, "blogs", blogId, "comments");
  await addDoc(commentRef, {
    name,
    text,
    createdAt: serverTimestamp()
  });
};
