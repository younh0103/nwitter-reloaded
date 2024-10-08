import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createAt: number;
    likeCount: number;
}

const Wrapper = styled.div`
    display: flex;
    gap: 20px;
    flex-direction: column;
    overflow-y: scroll;
`;

export default function Timeline() {
    const [tweets, setTweet] = useState<ITweet[]>([]);
    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        const fetchTweets = async () => {
          const tweetsQuery = query(
            collection(db, "tweets"),
            orderBy("createAt", "desc"),
            limit(25)
          );
          /* const spanshot = await getDocs(tweetsQuery);
            const tweets = spanshot.docs.map((doc) => {
              const { tweet, createAt, userId, username, photo } = doc.data();
              return {
                tweet,
                createdAt,
                userId,
                username,
                photo,
                id: doc.id,
              };
            }); */
          unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
            const tweets = snapshot.docs.map((doc) => {
              const { tweet, createAt, userId, username, photo, likeCount } = doc.data();
              return {
                tweet,
                createAt,
                userId,
                username,
                photo,
                id: doc.id,
                likeCount,
              };
            });
            setTweet(tweets);
          });
        };
        fetchTweets();
        return () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          unsubscribe && unsubscribe();
        };
      }, []);
    return (
    <Wrapper>
        {tweets.map((tweet) => (
            <Tweet key={tweet.id} {...tweet} />
        ))}
    </Wrapper>
    );
}