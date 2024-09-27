import { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 20px;
    background-color: black;
    border: 2px solid white;
    border-radius: 20px;
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    color: white;
    resize: none;
    &::placeholder {
    font-size: 16px;
    }
    &:focus {
    outline: none;
    border-color: #1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0px;
    border: 1px solid currentColor;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    color: #1d9bf0;
    text-align: center;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    padding: 10px 0px;
    background-color: #1d9bf0;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    color: white;
    cursor: pointer;
    &:hover,
    &:active {
    opacity: 0.9;
    }
`;

export interface EditTweet{
    tweet: string,
    photo?: string,
    id: string,
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
};

export default function EditTweetForm({ tweet, photo, id, setIsEditing }:EditTweet){
    const [isLoading, setIsLoading] = useState(false);
    const [editTweet, setEditTweet] = useState(tweet);
    const [editFile, setEditFile] = useState<File | null>(null);

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditTweet(e.target.value);
    };

    const onEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;

        if(files && files.length === 1) {
            const file = files[0];
            // 파일 크기 제한 (1MB 이하)
            const maxFileSize = 1 * 1024 * 1024;    // 1MB(1,048,576 bytes)
            if(file.size > maxFileSize) {
                alert("파일 크기는 1MB 이하만 업로드할 수 있습니다.");
                return;
            } 

            setEditFile(file);
        }
    };

    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if(!user || isLoading || editTweet === "" || editTweet.length > 180) return;

        try {
            setIsLoading(true);
            const tweetRef = doc(db, "tweets", id);
            await updateDoc(tweetRef, {
                tweet: editTweet,
            });

            if(editFile) {
                if(photo) {
                    const originRef = ref(storage, `tweets/${user.uid}/${id}`);
                    await deleteObject(originRef);
                }

                const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
                const result = await uploadBytes(locationRef, editFile);
                const url = await getDownloadURL(result.ref);

                await updateDoc(tweetRef, {
                    photo: url,
                });
            }
            setEditTweet("");
            setEditFile(null);
            setIsEditing(false);
        } catch(e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <Form onSubmit={onSubmit}>
            <TextArea required rows={5} maxLength={180} onChange={onChange} value={editTweet} />
            <AttachFileButton htmlFor={`editFile${id}`}>{editFile ? "Photo added ✅" : photo ? "Change photo" : "Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onEditFileChange} id={`editFile${id}`} type="file" accept="image/*"/>
            <SubmitBtn type="submit" value={isLoading ? "Editing..." : "Edit Tweet" }/> 
        </Form>
    );
}