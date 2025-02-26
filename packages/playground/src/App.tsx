import { transformFigmaToHtml, transformFigmaToHtmlBatch } from "figma-to-html";
import "./App.css";
import { useCallback, useState } from "react";

function App() {
  const [address, setAddress] = useState<string>("");
  const [result, setResult] = useState<string>("generate...");
  const generate = useCallback(async () => {
    console.time("开始转换");
    transformFigmaToHtmlBatch(
      [
        "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-潮流服饰频道?node-id=441-2955&t=FEgDqVhDLwsoBiRN-4",
        "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-潮流服饰频道?node-id=78-4056&t=TFfnF9S6CrCX6Z4y-4",
        "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-潮流服饰频道?node-id=5-452&t=TFfnF9S6CrCX6Z4y-4",
        "https://www.figma.com/design/RIXZ57M73YaV4qONoDrtbh/UI-潮流服饰频道?node-id=34-3494&t=TFfnF9S6CrCX6Z4y-4",
      ],
      (process: number) => {
        console.log(`进度: ${(process * 100).toFixed(2)}%`);
      }
    ).then((res) => {
      console.log(res);
      console.timeEnd("开始转换");
    });
    if (!address) {
      return;
    }
    transformFigmaToHtml(address, (process: number) => {
      console.log(`进度: ${(process * 100).toFixed(2)}`);
    }).then((res) => {
      setResult(res);
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
