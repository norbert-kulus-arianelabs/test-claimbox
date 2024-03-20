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

import { ContractStateProvider } from "@src/utils/context/ContractStateContext";
import { ClaimingPage } from "@src/views/ClaimingPage";
import HederaWalletsProvider from "@src/utils/context/HederaWalletsContext";
import { ModalProvider } from "@src/utils/context/ModalContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  return (
    <ModalProvider>
      <HederaWalletsProvider>
        <ContractStateProvider>
          <div className="border-[24px] border-[#D7D7DC] relative w-full min-h-[100vh] px-12 py-10 flex flex-col grow-1">
            <div className="max-w-[1400px] min-w-[320px] mx-auto">
              <ClaimingPage />
            </div>

            <ToastContainer position='bottom-center'/>
          </div>
        </ContractStateProvider>
      </HederaWalletsProvider>
    </ModalProvider>
  );
};

export default App;
