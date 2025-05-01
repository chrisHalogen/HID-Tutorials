import { useEffect, useState } from "react";
import "./App.css";
import MarkdownRenderer from "./MarkdownRenderer";

function App() {
  const [content, setContent] = useState("");
  const [index, setIndex] = useState(5);

  const fetchMarkdown = (idx) => {
    fetch(`/markdowns/${idx}.md`)
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Failed to load markdown:", err));
  };

  useEffect(() => {
    fetchMarkdown(index);
  }, [index]);

  return (
    <div className="inner-container">
      <MarkdownRenderer>
        {content.replace(/(\[.*?\])/g, "$1\n")}
      </MarkdownRenderer>
    </div>
  );
}

export default App;
