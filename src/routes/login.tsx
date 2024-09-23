import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Error, Input, Switcher, Title, Wrapper, Form } from "../components/auth-components";
import GithubButton from "../components/github-btn";
import GoogleButton from "../components/google-btn";

export default function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ error, setError] = useState("");
    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { target : {name, value} } = e;
        if(name === "email") {
            setEmail(value)
        }else if(name === "password") {
            setPassword(value)
        }
    };
    const onSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if(isLoading || email === "" || password === "") return;
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch(e){
            if(e instanceof FirebaseError) {
                setError(e.message);
            }
        }finally {
            setLoading(false);
        }
    }
    return (
    <Wrapper>
        <Title>𝕏</Title>
        <Form onSubmit={onSubmit}>
            <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
            <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
            <Input type="submit" value={isLoading ? "Loading..." : "Log In"}/>
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Switcher>
            New to 𝕏 ?{" "}
            <Link to="/create-account">Sign up</Link>
        </Switcher>
        <Switcher>
            <Link to="/find-password">Forgot Password ?</Link>
        </Switcher>
        <GoogleButton />
        <GithubButton />
    </Wrapper>
    );
}