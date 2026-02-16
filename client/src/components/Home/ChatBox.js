import React, { useContext } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import socket from "../../socket";
import { MessagesContext } from "./Home";

const ChatBox = ({ userid }) => {
  const { setMessages } = useContext(MessagesContext);

  return (
    <Formik
      initialValues={{ message: "" }}
      validationSchema={Yup.object({
        message: Yup.string().min(1).max(255),
      })}
      onSubmit={(values, action) => {
        const message = { to: userid, from: null, content: values.message };
        socket.emit("dm", message);
        setMessages((prevMsg) => [...prevMsg, message]);
        action.resetForm();
      }}
    >
      {({ handleSubmit }) => (
        <div className="p-6 bg-gradient-to-t from-dark/90 to-transparent">
          <Form
            className="max-w-4xl mx-auto glass p-2 rounded-[2rem] flex items-center gap-2 border border-white/10 shadow-2xl relative transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(13,200,242,0.15)]"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <button type="button" className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center">
              <span className="material-symbols-outlined">add_circle</span>
            </button>

            <Field
              name="message"
              placeholder="Type an encrypted message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 text-white min-w-0 h-full outline-none"
            />

            <div className="flex items-center gap-1 pr-1">
              <button type="button" className="p-3 rounded-full text-slate-400 hover:text-yellow-400 hover:bg-white/5 transition-all active:scale-95 group flex items-center justify-center">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">mood</span>
              </button>
              <button type="button" className="p-3 rounded-full text-slate-400 hover:text-primary hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button type="submit" className="size-10 rounded-full bg-primary hover:bg-primary/90 text-dark flex items-center justify-center shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 ml-2 hover:shadow-primary/40">
                <span className="material-symbols-outlined fill-1">send</span>
              </button>
            </div>
          </Form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-help">
              <span className="material-symbols-outlined text-xs">lock</span>
              End-to-end encrypted
            </p>
          </div>
        </div>
      )}
    </Formik>
  );
};
export default ChatBox;
