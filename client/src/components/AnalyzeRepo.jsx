import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/AnalyzeRepo.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "github-markdown-css/github-markdown.css";
import remarkGfm from "remark-gfm";
import { twilight, coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";

const AnalyzeRepo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const repo = location.state?.repo;

  const [repoFiles, setRepoFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const codeRef = useRef(null);

  useEffect(() => {
    const fetchRepoFiles = async () => {
      setLoading(true);

      setFileContent("");

      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`,
        );

        setRepoFiles(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (repo) {
      fetchRepoFiles();
    }
  }, [repo]);

  const handleFileClick = async (file) => {
    setAnalysis("");

    const supportedExtensions = [
      "js",
      "jsx",
      "ts",
      "tsx",
      "html",
      "css",
      "json",
      "py",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!supportedExtensions.includes(extension)) {
      alert("Unsupported file type");
      return;
    }

    setSelectedFile(file);

    try {
      const response = await axios.get(file.url);

      const decodedContent = atob(response.data.content.replace(/\n/g, ""));

      setFileContent(decodedContent);

      setTimeout(() => {
        codeRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };

  const openFolder = async (folder) => {
    try {
      const response = await axios.get(folder.url);

      setRepoFiles(response.data);

      setSelectedFile(null);

      setFileContent("");

      setAnalysis("");
    } catch (error) {
      console.log(error);
    }
  };

  const analyzeCodeWithAI = async () => {
    try {
      setAnalyzing(true);
      setAnalysis("");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
          code: fileContent.slice(0, 8000),
        },
      );

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.log(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="analyze-container">
      <h1 className="analyze-heading">Repository Analysis</h1>

      <div className="repo-info">
        <h2>{repo?.name}</h2>

        <p>{repo?.description || "No description available"}</p>
      </div>

      {loading ? (
        <h2>Loading Files...</h2>
      ) : (
        <div className="repo-files">
          {repoFiles.map((file) => (
            <div key={file.path} className="file-card">
              <div>
                <h3>{file.name}</h3>
              </div>

              {file.type === "file" ? (
                <button
                  className="analyze-btn"
                  onClick={() => handleFileClick(file)}
                >
                  Analyze File
                </button>
              ) : (
                <button
                  className="folder-btn"
                  disabled={loading}
                  onClick={() => openFolder(file)}
                >
                  {loading ? "Loading..." : "Open Folder"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedFile && (
        <div className="code-container" ref={codeRef}>
          <h2>{selectedFile.name}</h2>
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(fileContent)}
          >
            Copy Code
          </button>

          {fileContent && (
            <SyntaxHighlighter
              language={
                {
                  js: "javascript",
                  jsx: "jsx",
                  ts: "typescript",
                  tsx: "tsx",
                  html: "html",
                  css: "css",
                  json: "json",
                  py: "python",
                  java: "java",
                  cpp: "cpp",
                  cxx: "cpp",
                  cc: "cpp",
                  c: "c",
                  cs: "csharp",
                  go: "go",
                  rs: "rust",
                  php: "php",
                  rb: "ruby",
                }[selectedFile?.name?.split(".").pop()?.toLowerCase()] || "text"
              }
              style={selectedFile?.name.endsWith(".html") ? coy : twilight}
              wrapLongLines={false}
              showLineNumbers
              customStyle={{
                borderRadius: "15px",
                padding: "20px",
                fontSize: "14px",
                whiteSpace: "pre",
                overflowX: "auto",
                tabSize: 2,

                maxWidth: "100%",
              }}
            >
              {String(fileContent)}
            </SyntaxHighlighter>
          )}

          <button
            className="analyze-btn"
            onClick={analyzeCodeWithAI}
            disabled={analyzing}
          >
            {analyzing ? (
              <span className="loader-btn">
                <span className="spinner"></span>
                Analyzing...
              </span>
            ) : (
              "Analyze with AI"
            )}
          </button>

          {analysis && (
            <div className="ai-analysis">
              <h2>AI Analysis</h2>

              <div className="markdown-body analysis-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyzeRepo;
