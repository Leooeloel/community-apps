import type { AppContext } from "@netless/window-manager";
import type { RoomState } from "white-web-sdk";
import { useEffect, useMemo, useState } from "react";

export function useStorage<T>(
  context: AppContext,
  namespace: string,
  defaultState: () => T
): [T, (v: Partial<T>) => void] {
  const [storage] = useState(() =>
    context.createStorage<T>(namespace, defaultState())
  );
  const [state, _setState] = useState(storage.state);
  const setState = useMemo(() => storage.setState.bind(storage), [context]);

  useEffect(
    () =>
      storage.addStateChangedListener(() => {
        _setState({ ...storage.state });
      }),
    [storage]
  );

  return [state, setState];
}

export function useMembers(context: AppContext): number[] {
  const [memebers, setMemebers] = useState(() =>
    context.getDisplayer().state.roomMembers.map((memebr) => memebr.memberId)
  );

  useEffect(() => {
    const displayer = context.getDisplayer();
    const handler = (state: Partial<RoomState>) => {
      if (state.roomMembers) {
        setMemebers(
          displayer.state.roomMembers.map((memebr) => memebr.memberId)
        );
      }
    };
    displayer.callbacks.on("onRoomStateChanged", handler);
    return () => {
      displayer.callbacks.off("onRoomStateChanged", handler);
    };
  }, [context]);

  return memebers;
}

export function useMemeberID(context: AppContext): number {
  return useMemo(() => context.getDisplayer().observerId, [context]);
}
