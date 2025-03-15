import { FigmaParser } from "figma-to-html";
import "./App.css";
import { useCallback, useState } from "react";

const errorImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAwCAYAAABAIGlOAAAAAXNSR0IArs4c6QAAAjZJREFUaEPtmFFygzAMRHEu1uYOges0uU7IHUJPplZMnNFQkNYgJ57i/OQHbD2t1pYIzU5+YSecTQX9b0pXRXer6Ol0+iwJ/na7DSnxQKXbtu29aZqiQBkyhHC5Xq9nBBgFJWSxVz+TGzSpZDLBj9WVFbTve6gKMgE2fFaEENhKFXQuyZA6bds+PVoVzVWrk3Vr6RqJrqUrE1Q9qpQLeym1TUNsXpRHYzApFzoCyc8UBSp7YyI6eipbDKgMJKrkefcWAzo36XiW8AP0i6eplHVdr5eu685ExEH8+aUEhfg1zseoLVxB5TXkCSuHfhRsur8bKDqco4eTLNGZpA0hhG906B4nHaRMrIZh7gBS1h36vj9q+6JJ+/XpQEQXRGUX0ITARr4lvyYm7JkrxP+bQT2DMxLGXzYWv1tZltgMah1AWolKJbQTW97Dyn6qJTaBasEh3pegKICmuqbqatC1JSsTEAOzEjZRVPv0uqjqatDUA2hOYRRUKmVYxRfUQ00Gj0pZSYugyL5LffUqRa3AEH+mgPJ9yXevVeJyzc2dER8gS/0sCjidaoDEvR40FUZ7HvVobDKABPt51BM0Xi+I95B9tQ4p2aPIhugzk3tUvTa4ied1NVW1Af+toLLv1VRFlLf63beDxhOVoZVTVT2MLEh4TEOOdbRc555De17rXbWv3hJgzneB5MKzKKxoTiBtbfbt4XAYRzMi+nj8X/gfGbbl2pBH3wXquW8F9cxmCWtVRUtQwTOGHz4GEE9rpxzOAAAAAElFTkSuQmCC`;

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
        figmaParser.parseToImage().then((res) => {
          const a = document.createElement("a");
          a.href = res as string;
          a.download = "image.png";
          a.click();
        });
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
          "https://www.figma.com/design/wdSooKUtOwOJuDulR1L6nt/组织管理?node-id=28-8970&t=6YXb8fdqDYb9u3NE-4",
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
