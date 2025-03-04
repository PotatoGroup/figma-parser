import { FigmaParser } from "figma-to-html";
import "./App.css";
import { useCallback, useState } from "react";

const figmaParser = new FigmaParser({
  clientId: "cJvW5Of2z1fahRyeR2xp9T",
  clientSecret: "OiGpuQXKIcm9OOHXE1BlzujTxUPER1",
});

function App() {
  const [address, setAddress] = useState<string>("");
  const [result, setResult] = useState<string | string[]>("generate...");
  const [progress, setProgress] = useState<number>(0);

  const generate = useCallback(async () => {
    console.time("transformFigmaToHtml");
    if (!address) {
      return;
    }
    figmaParser
      .parse(address, {
        onProgress: (process: number) => {
          setProgress(Math.floor(process));
        },
      })
      .then((res: string | string[]) => {
        setResult(res);
        console.timeEnd("transformFigmaToHtml");
      });
  }, [address]);

  const generateBatch = useCallback(async () => {
    console.time("transformFigmaToHtml");
    figmaParser
      .parseBatch(
        [
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=36-15405&t=fbKNknstAWIskNOm-4",
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=30-11247&t=6YXb8fdqDYb9u3NE-4",
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=36-30234&t=6YXb8fdqDYb9u3NE-4",
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=29-11148&t=6YXb8fdqDYb9u3NE-4",
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=28-8970&t=6YXb8fdqDYb9u3NE-4"
        ],
        {
          onProgress: (process: number) => {
            setProgress(Math.floor(process));
          },
        }
      )
      .then((res: string | string[]) => {
        setResult(res);
        console.timeEnd("transformFigmaToHtml");
      });
  }, []);

  const renderResult = (result: string | string[]) => {
    if (Array.isArray(result)) {
      return result.map((item, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: item }}></div>
      ));
    }
    return <div dangerouslySetInnerHTML={{ __html: result }}></div>;
  };

  return (
    <div>
      <input
        type="text"
        placeholder="输入figma设计稿地址"
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={generate}>generate</button>
      <button onClick={generateBatch}>generateBatch</button>
      <div
        style={{
          color: "green",
          fontSize: "16px",
          fontWeight: "bold",
          padding: 24,
          display: progress === 0 ? "none" : "block",
        }}
      >
        转换进度：{progress}%
      </div>
      <div
        style={{
          display: progress === 100 ? "flex" : "none",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h3>----- 生成结果 -----</h3>
        {renderResult(result)}
      </div>
    </div>
  );
}

export default App;
