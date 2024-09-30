import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import { useNavigate, useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import "codemirror/lib/codemirror.css"; // Import CodeMirror styles

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);
  const editorRef = useRef(null); // Reference for CodeMirror editor

  useEffect(() => {
    const handleErrors = (err) => {
      console.log("Error", err);
      toast.error("Socket connection failed, try again later");
      navigate("/");
    };

    const init = async () => {
      socketRef.current = await initSocket();

      if (!socketRef.current) {
        handleErrors(new Error("Socket initialization failed"));
        return;
      }

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        // Sync code on joining
        socketRef.current.emit(ACTIONS.SYNC_CODE, { code: codeRef.current });
      });

      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        console.log("Code change received:", code); // Debugging line
        console.log("Editor Ref Current:", editorRef.current); // Debugging line
        if (editorRef.current) {
          editorRef.current.setValue(code); // Update editor for other clients
        }
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };

    init();

    // Confirmation dialog for unsaved changes
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        const confirmationMessage = "You have unsaved changes. Do you really want to leave?";
        event.returnValue = confirmationMessage; // Show confirmation dialog
        return confirmationMessage; // For some browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.CODE_CHANGE);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      window.removeEventListener("beforeunload", handleBeforeUnload); // Clean up event listener
    };
  }, [navigate, roomId, location.state, hasUnsavedChanges]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 bg-dark text-light d-flex flex-column">
          <img
            src="/images/codecast.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "150px", marginTop: "-43px" }}
          />
          <hr style={{ marginTop: "-3rem" }} />
          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-5">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn btn-success w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>
        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column">
          {/* Language selector */}
          <div className="bg-dark p-2 d-flex justify-content-end">
            <select
              className="form-select w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option style={{ fontFamily: "urbanist" }} key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
              setHasUnsavedChanges(true); // Mark as having unsaved changes
              if (socketRef.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
              }
            }}
            editorRef={editorRef} // Pass the editorRef to the Editor component
          />
        </div>
      </div>

      {/* Compile button */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-3"
        onClick={toggleCompileWindow}
        style={{ zIndex: 1050 }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler section */}
      <div
        className={`bg-dark text-light p-3 ${isCompileWindowOpen ? "d-block" : "d-none"}`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Compiler Output ({selectedLanguage})</h5>
          <div>
            <button className="btn btn-secondary" onClick={runCode} disabled={isCompiling}>
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
          </div>
        </div>
        <pre className="bg-light text-dark p-2 rounded" style={{ overflowY: "auto", maxHeight: "80%" }}>
          {output}
        </pre>
      </div> 
    </div>
  );
}

export default EditorPage;
