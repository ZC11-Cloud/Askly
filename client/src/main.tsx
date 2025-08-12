import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import { DashboardPage } from "./routes/dashboardPage/DashboardPage.jsx";
import { HomePage } from "./routes/homePage/HomePage.jsx";
import { RootLayout } from "./layouts/rootLayout/RootLayout.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout/DashboardLayout.jsx";
import { ChatPage } from "./routes/chatPage/ChatPage.jsx";
import { SignInPage } from "./routes/signInPage/SignInPage.jsx";
import { SignUpPage } from "./routes/signUpPage/SignUpPage.jsx";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/sign-in/*",
        element: <SignInPage />,
      },
      {
        path: "/sign-up/*",
        element: <SignUpPage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/dashboard/chat/:id",
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
