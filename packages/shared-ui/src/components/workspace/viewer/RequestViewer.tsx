import { FolderItem, HttpMethod, RequestItem } from "common-utils/types";
import Split from "react-split";
import "@styles/viewer.css";
import { RequestPanel } from "@components/workspace/panels/request/RequestPanel";
import { ResponsePanel } from "@components/workspace/panels/ResponsePanel";
import { useLiveStore } from "@configs/liveblocks.config";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { WritableDraft } from "immer";
import { fetchRequestItem, useRequestFetch } from "@others/utils";

type RequestContextType = {
  updateRequestItem: (
    callback: (item: WritableDraft<RequestItem>) => void
  ) => void;
};
const RequestContext = React.createContext<RequestContextType | null>(null);

export const useRequestContext = () => {
  const context = React.useContext(RequestContext);
  if (!context) {
    throw new Error("useRequestContext must be used within a RequestViewer");
  }
  return context;
};

export type RequestViewerProps = {
  id: string;
  collectionId: string;
  method: HttpMethod;
};

export default function RequestViewer({
  id,
  collectionId,
  method,
}: RequestViewerProps) {
  const { path, request, updateItem, updateRequestItem } = useLiveStore(
    useShallow((state) => ({
      path: state.getItemPath(collectionId, id),
      request: state.getRequest(collectionId, id),
      updateRequestItem: (
        callback: (item: WritableDraft<RequestItem>) => void
      ) => {
        state.updateItem2(collectionId, callback as any, id);
      },
      updateItem: state.updateItem,
    }))
  );

  const [sizes, setSizes] = useState([70, 30]);

  const reqFetch = useRequestFetch();

  function handleSendRequest() {
    if (!request) return;
    reqFetch.make(request);
  }
  if (!request) return "Request not found";
  return (
    <RequestContext.Provider value={{ updateRequestItem }}>
      <div className="req-viewer">
        <Split
          sizes={sizes}
          onDragEnd={(sizes) => setSizes(sizes)}
          gutterSize={1}
          minSize={[100, 0]}
          snapOffset={[0, 100]}
          className="split-h"
          direction="vertical"
        >
          <RequestPanel
            path={path}
            request={request}
            collectionId={collectionId}
            isLoading={reqFetch.isLoading}
            onHttpMethodChange={(method) => {
              updateItem(collectionId, { method }, id);
            }}
            onUrlChange={(url) => {
              updateItem(collectionId, { url }, id);
            }}
            onSendRequest={handleSendRequest}
          />
          <ResponsePanel
            isError={reqFetch.error !== undefined}
            isLoading={reqFetch.isLoading}
            contentType={reqFetch.data?.contentType}
            errorMessage={reqFetch.error}
            onClear={reqFetch.clear}
            headers={reqFetch.data?.headers}
            res={{
              data: reqFetch.data?.data,
              size: reqFetch.data?.size || 0,
            }}
            status={reqFetch.data?.status}
            statusCode={reqFetch.data?.statusCode}
            
          />
        </Split>
      </div>
    </RequestContext.Provider>
  );
}
