import { useState } from "react";
import { Body, RequestItem } from "common-utils/types";
import Raw from "./items/Raw";
import Dropdown from "@components/Dropdown";
import RadioGroup, { RadioItem } from "@components/RadioGroup";
import FormData from "./items/FormData";
import { useRequestContext } from "@components/workspace/viewer/RequestViewer";
import { WritableDraft } from "immer";

const options = ["none", "form-data", "x-www-form-urlencoded", "raw", "binary"];
const rawOptions = ["text", "json", "javascript", "html", "xml"];
type BodyTabItemProps = {
  body: Body;
  reqId: string;
};
function updateContentTypeHeader(item: WritableDraft<RequestItem>) {
  let contentType = "";
  const bodyType = item.body.active;
  const buildRawContent = () => {
    switch (item.body.raw.type) {
      case "text":
        contentType = "text/plain";
        break;
      case "json":
        contentType = "application/json";
        break;
      case "javascript":
        contentType = "application/javascript";
        break;
      case "html":
        contentType = "text/html";
        break;
      case "xml":
        contentType = "application/xml";
        break;
    }
  };
  switch (bodyType) {
    case "binary":
      contentType = "application/octet-stream";
      break;
    case "form-data":
      contentType = "multipart/form-data";
      break;
    case "x-www-form-urlencoded":
      contentType = "application/x-www-form-urlencoded";
      break;
    case "raw":
      buildRawContent();
      break;
  }

  if (contentType) {
    item.headers["Content-Type"] = contentType;
  }
  console.log("contentType", item.headers);

}

export function BodyTabItem(props: BodyTabItemProps) {
  const { updateRequestItem } = useRequestContext();
  const activeOption = props.body.active;
  function updateOption(i: number) {
    updateRequestItem((item) => {
      item.body.active = options[i] as any;
      updateContentTypeHeader(item);
    });
  }

  function updateRawOption(rawOption: string) {
    setRawOption(rawOption);
    updateRequestItem((item) => {
      item.body.raw.type = rawOption as any;
      updateContentTypeHeader(item);
    });
  }
  const activeOptionIndex = options.indexOf(activeOption);

  const [rawOption, setRawOption] = useState(props.body.raw.type as string);
  return (
    <div className="body-tab-item">
      {/* header */}
      <div className="header">
        <RadioGroup activeIndex={activeOptionIndex} onChange={updateOption}>
          {options.map((option) => (
            <RadioItem key={option} value={option} />
          ))}
        </RadioGroup>
        {activeOption === "raw" && (
          <Dropdown
            items={rawOptions}
            activeItem={rawOption}
            onItemSelect={updateRawOption}
          />
        )}
      </div>
      {/* content */}
      <Content
        reqId={props.reqId}
        body={props.body}
        option={activeOption}
        rawOption={rawOption}
      />
    </div>
  );
}

export type ContentProps = {
  body: Body;
  option: string;
  rawOption: string;
  reqId: string;
};

function Content(props: ContentProps) {
  if (props.option === "none") {
    return <div>this request has no body</div>;
  }
  if (props.option === "form-data") {
    return <FormData {...props} />;
  }
  if (props.option === "x-www-form-urlencoded") {
    return <div>coming soon</div>;
  }
  if (props.option === "raw") {
    return <Raw {...props} />;
  }
  if (props.option === "binary") {
    return <div>coming soon</div>;
  }

  return <div></div>;
}
