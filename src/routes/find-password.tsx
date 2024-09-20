import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";

export default function FindPassword() {
    const navigate = useNavigate();

    const[isLoading, setLoading] = useState(false);
    const[email, setEmail] = useState("");
    const[error, setError] = useState("");

    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: {name, value},
        } = e;
        if(name === "email") {
            setEmail(value);
        }
    };

    const onSubmit = async(e : React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if(isLoading || email === "") return;   // 로딩중이거나 이메일이 비어있으면 함수 실행을 종료.
        try {
            setLoading(true);

            await sendPasswordResetEmail(auth, email);
            alert("Success sending email !");
            navigate("/login");
        } catch(e) {
            if(e instanceof FirebaseError) {
                setError(e.message);
            }
        } finally {
            setLoading(false);  // try~catch 실행한 후, 로딩 상태를 false로 설정
        }
    };

    return (
        <Wrapper>
            <Title>Find password</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="email" value={email}
                placeholder="Email" type="email" required />
                <Input type="submit" value={isLoading ? "Loading..." : "Send Email"} />
            </Form>
            {error !== "" ? <Error>{error}</Error> : null}
            <Switcher>
                Already have an account ?{" "}
                <Link to="/login">Login &rarr;</Link>
            </Switcher>
        </Wrapper>
    )
}