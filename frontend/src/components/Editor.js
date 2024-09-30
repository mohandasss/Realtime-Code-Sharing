import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

// Throttle function to limit the number of calls to the onCodeChange handler
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null); // Reference for the CodeMirror instance
  const textareaRef = useRef(null); // Reference for the textarea

  useEffect(() => {
    const init = async () => {
      const textarea = textareaRef.current; // Get textarea reference
      if (!textarea) return;

      // Initialize CodeMirror only if it hasn't been initialized
      if (!editorRef.current) {
        const editor = CodeMirror.fromTextArea(textarea, {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        });

        editorRef.current = editor; // Set editorRef
        editor.setSize(null, "100%");

        const handleChange = throttle((code) => {
          onCodeChange(code); // Call the parent onCodeChange function
          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }
        }, 900); // Throttle updates every 300ms

        editor.on("change", (instance) => {
          const code = instance.getValue();
          handleChange(code);
        });
      }
    };

    init();
  }, [roomId, socketRef, onCodeChange]);

  useEffect(() => {
    if (socketRef.current && editorRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        const editor = editorRef.current;

        if (editor.getValue() !== code) {
          editor.setValue(code); // Update the editor's content
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef]);

  return (
    <div style={{ height: "700px" }}>
      <textarea ref={textareaRef} id="realtimeEditor" style={{ display: "none" }}></textarea>
    </div>
  );
}

export default Editor;
