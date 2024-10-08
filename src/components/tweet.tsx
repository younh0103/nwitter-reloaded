import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import EditTweetForm from "./edit-tweet-form";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: 1fr;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 15px;
`;

const Column = styled.div`
    
`;

const Photo = styled.img`
    width: 150px;
    height: 150px;
    border-radius: 15px;
    margin-left: 10px;
`;

const Username = styled.span`
    font-weight: 600;
    font-size: 15px;
`;

const Payload = styled.p`
    margin: 10px 0px;
    font-size: 18px;
`;

const DeleteButton = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

const EditButton = styled.button`
    background-color: #1d9bf0;
    color: white;
    font-weight: 600;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
`;

const CancelButton = styled.button`
    background-color: #b7beb7;
    color: white;
    font-weight: 600;
    padding: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 5px;
`;

const LikeButton = styled.div`
    margin: 20px 0 10px 0;
    svg {
        width: 24px;
        height: 24px;
    }
`;

export default function Tweet({username, photo, tweet, userId, id}: ITweet) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [islikeCount, setLikeCount] = useState(0);
    const user = auth.currentUser;
    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete this tweet ?");
        if(!ok || user?.uid !== userId) return;
        try {
            await deleteDoc(doc(db, "tweets", id));
            if(photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch(e) {
            console.log(e);
        } finally{
            //
        }   
    }
    
    const onEdit = () => setIsEditing((prev) => !prev);

    const onLiked = async() => {
        const tweetRef = doc(db, "tweets", id);

        if(!user || isLiked) {
            setIsLiked(false);
            setLikeCount(islikeCount - 1);
            await updateDoc(tweetRef, {
                likeCount: islikeCount - 1,
            });
        } else {
            setIsLiked(true);
            setLikeCount(islikeCount + 1);
            await updateDoc(tweetRef, {
                likeCount: islikeCount + 1,
            });
        }
    };

    return(
        <Wrapper>
            <Column>
                {isEditing ? null : <Username>{username}</Username>}
                {isEditing ? (<EditTweetForm tweet={tweet} photo={photo} id={id} setIsEditing={setIsEditing}></EditTweetForm>) : (<Payload>{tweet}</Payload>)}
                {isEditing ? null : user ?.uid === userId ? <EditButton onClick={onEdit}>Edit</EditButton> : null }
                {user ?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null }
                {isEditing ? <CancelButton onClick={onEdit}>Cancel</CancelButton> : null}
            </Column>
            <Column>
            {photo ? (
                <Photo src={photo} />
            ) : null}
            </Column>
            <LikeButton onClick={onLiked}>
                {isLiked ? 
                   <HeartFilled style={{color: 'red'}}/> : <HeartOutlined/> }
                <h3>  {islikeCount}</h3>
            </LikeButton>
        </Wrapper>
    )
}