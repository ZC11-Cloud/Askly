import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import "./homePage.css";
export const HomePage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className="homePage">
      <img src="/orbital.png" alt="" className="orbital" />
      <div className="left">
        <h1>Askly</h1>
        <h2>Supercharge your creativity and productivity</h2>
        <h3>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.Magnam
          debitis, deleniti dolore sit excepturi dicta cumque incidunt eaque
        </h3>

        <Link to="/dashboard">
          <button>Get Started</button>
        </Link>
        {/* <button onClick={test}>测试</button> */}
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="" className="bot" />
        </div>
        <div className="typing">
          {typingStatus === "human1" ? (
            <img src="/human1.jpeg"></img>
          ) : typingStatus === "human2" ? (
            <img src="/human2.jpeg"></img>
          ) : (
            <img src="/bot.png"></img>
          )}

          <TypeAnimation
            sequence={[
              2000,
              () => {
                setTypingStatus("human1");
              },
              "Hi, how can I help you today?",
              2000,
              () => {
                setTypingStatus("bot");
              },
              "Hello! I want to improve my work efficiency.",
              2000,
              () => {
                setTypingStatus("human2");
              },
              "No problem. I can help you organize your tasks.",
              2000,
              () => {
                setTypingStatus("bot");
              },
              "Great! Can you also help me brainstorm ideas?",
            ]}
            wrapper="span"
            speed={50}
            style={{ fontSize: "1em", display: "inline-block" }}
            repeat={Infinity}
          />
        </div>
      </div>
      <div className="term">
        <img src="/logo.png" alt="" className="logo" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <span>|</span>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};
