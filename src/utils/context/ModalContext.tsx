/*
 * Hedera Claimbox NFT Claim Page
 *
 * Copyright (C) 2023 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { createContext, useState } from "react";

export type ModalTypes =
  | "WalletConnectionModal"
  | "MultiPriceClaimModal"
  | string;

type ModalState = {
  [key in ModalTypes]?: boolean;
};

interface ModalContextProps {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
}

export const ModalContext = createContext<ModalContextProps | undefined>(
  undefined
);

interface ModalProviderProps {
  children: React.ReactNode;
}
export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalState, setModalState] = useState<ModalState>({});

  return (
    <ModalContext.Provider value={{ modalState, setModalState }}>
      {children}
    </ModalContext.Provider>
  );
};
