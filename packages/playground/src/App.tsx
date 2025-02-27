import { transformFigmaToHtml } from "figma-to-html";
import "./App.css";
import { useCallback, useState } from "react";

function App() {
  const [address, setAddress] = useState<string>("");
  const [result, setResult] = useState<string>("generate...");
  const generate = useCallback(async () => {
    console.time("transformFigmaToHtml");
    if (!address) {
      return;
    }
    transformFigmaToHtml(address, (process: number) => {
      console.log(`进度: ${(process * 100).toFixed(2)}`);
    }).then((res) => {
      setResult(res);
      console.timeEnd("transformFigmaToHtml");
    });
  }, [address]);

  return (
    <div>
      <input
        type="text"
        placeholder="输入figma设计稿地址"
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={generate}>generate</button>
      <div>
        <h3>生成结果</h3>
        {result && <div dangerouslySetInnerHTML={{ __html: result }}></div>}
      </div>
    </div>
  );
}

export default App;
