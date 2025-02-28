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
      .then((res) => {
        setResult(res);
        console.timeEnd("transformFigmaToHtml");
      });
  }, [address]);

  const generateBatch = useCallback(async () => {
    console.time("transformFigmaToHtml");
    figmaParser
      .parseBatch(
        [
          "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-潮流服饰频道?node-id=441-2955&t=FEgDqVhDLwsoBiRN-4",
          "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-%E6%BD%AE%E6%B5%81%E6%9C%8D%E9%A5%B0%E9%A2%91%E9%81%93?node-id=441-2050&t=GqlTVz6XCSUMEcfv-4",
          "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-%E6%BD%AE%E6%B5%81%E6%9C%8D%E9%A5%B0%E9%A2%91%E9%81%93?node-id=276-3506&t=GqlTVz6XCSUMEcfv-4",
        ],
        {
          onProgress: (process: number) => {
            setProgress(Math.floor(process));
          },
        }
      )
      .then((res) => {
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
          color: "red",
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
          display: "flex",
          flexDirection: "column",
          gap: 16,
          visibility: progress === 100 ? "visible" : "hidden",
        }}
      >
        <h3>生成结果</h3>
        {renderResult(result)}
      </div>
    </div>
  );
}

export default App;
