import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle, styled } from "styled-components";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-route";
import reset from "styled-reset";
import FindPassword from "./routes/find-password";

const router = createBrowserRouter([
  {
    path:"/",
    element : 
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>,
    children : [
      {
        path :"",
        element : <Home />,
      },
      {
        path : "profile",
        element : <Profile />,
      },
    ] 
  },
  {
    path : "/login",
    element : <Login />
  },
  {
    path : "/create-account", 
    element : <CreateAccount />
  },
  {
    path : "/find-password",
    element : <FindPassword />
  },
]);

const GlobalStyles = createGlobalStyle<object>`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  ::-webkit-scrollbar {
    display: none;
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLogin] = useState(true);
  const init = async() => {
    await auth.authStateReady();
    setLogin(false);
  }
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App
