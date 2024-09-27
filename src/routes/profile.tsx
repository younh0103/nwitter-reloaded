import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
`;

const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #787f84;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
        width: 50px;
    }
`;

const AvatarImg = styled.img`
    width: 100%;
`;

const AvatarInput = styled.input`
    display: none;
`;

const Form = styled.form`
    display: flex;
`;

const Name = styled.span`
    display: flex;
    font-size: 22px;
`;

const Tweets = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
`; 

const EditImg =styled.div`
    width: 24px;
    height: 24px;
    margin-left: 5px;
    color: #1d9bf0;
    cursor: pointer;
    svg {
        width: 100%;
        height: 100%;
    }
    &:hover {
        svg {
            opacity: 0.8;
        }
    }
`;

const NameInput = styled.input`
    border: 1px solid white;
    padding: 0px 5px;
    border-radius: 5px;
    font-size: 22px;
    color: white;
    background-color: black;
    width: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    &::placeholder {
        font-size: 18px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const EditBtn = styled.button`
    background-color: black;
    border: none;
    color: #1d9bf0;
    cursor: pointer;
    svg {
        width: 24px;
        height: 24px;
    }
    &:hover {
        svg {
            opacity: 0.8;
        }
    }
`;

export default function Profile() {
    let user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [nickname, setNickname] = useState(user?.displayName);
    const [isEditable, setEditable] = useState(false);

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if(!user) return;
        if(files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatar/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);

            await updateProfile(user, {
                photoURL: avatarUrl,
            });
        }
    }; 

    const fetchTweets = async() => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createAt", "desc"),
            limit(25)
        );

        // const snapshot = await getDocs(tweetQuery);

        const unsubscript = onSnapshot(tweetQuery, (snapshot) => {
            const tweets = snapshot.docs.map(doc => {
                const { tweet, createAt, userId, username, photo } = doc.data();
                return {
                    tweet,
                    createAt,
                    userId, 
                    username,
                    photo,
                    id: doc.id,
                };
            });
            setTweets(tweets);
        });
        return () => unsubscript && unsubscript();
    };
    
    const initEditState = () => {
        setNickname(user?.displayName);
        onClickEdit();
    };

    const onClickEdit = async() => {
        setEditable((x) => !x);
    };
    
    const onChangeName = (e:React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    };

    const onSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        const ok = confirm(`Are you sure about change nickname to [${nickname}] ? `);

        if(ok) {
            e.preventDefault();

            if(user) {
                await updateProfile(user, {displayName: nickname});

                const qry = query(
                    collection(db, "tweets"),
                    where("userId", "==", user?.uid),
                );

                const snap = await getDocs(qry);

                snap.docs.forEach((doc) => {
                    updateDoc(doc.ref, {username: user?.displayName});
                });

                user = auth.currentUser;
            }
        }
        initEditState();
    };

    useEffect(() => {
        setNickname(user?.displayName);
        fetchTweets();
    }, [user?.displayName]);

    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {avatar ? <AvatarImg src={avatar} /> : 
                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                </svg> }
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*"/>
            {isEditable ? (
                <Form onSubmit={onSubmit}>
                    <NameInput name="nickname" type="text" value={nickname} onChange={onChangeName}/>
                    <EditBtn type="submit">
                        <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" />
                        </svg>
                    </EditBtn>
                </Form>
            ) : (
                <Name>
                    {nickname ?? "Anonymous"}
                    <EditImg onClick={onClickEdit}>
                        <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                    </EditImg>
                </Name>
            )}
            <Tweets>{tweets.map(tweet => <Tweet key={tweet.id}{...tweet} />)}</Tweets>
        </Wrapper>
    );
}