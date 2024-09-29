import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

// Debounce function to limit the number of calls to the onCodeChange handler
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current = editor;
      editor.setSize(null, "100%");

      const handleChange = debounce((code) => {
        onCodeChange(code);
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }, 1500); // Adjust delay as needed

      editor.on("change", (instance) => {
        const code = instance.getValue();
        handleChange(code);
      });
    };

    init();
  }, [roomId, socketRef, onCodeChange]);

  useEffect(() => {
    socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      editorRef.current.setValue(code);
    });

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef]);

  return (
    <div style={{ height: "700px" }}>
    <textarea id="realtimeEditor"></textarea>
  </div>
  );
}

export default Editor;
