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

import { ContractClaimingButton } from "@src/components/claiming-page/buttons/ContractClaimingButton";
import { ImageColumn } from "@src/components/claiming-page/ImageColumn";
import { ContractInformationColumn } from "@src/components/claiming-page/ContractInformationColumn";
import { WalletConnectionModal } from "@src/components/modals/WalletConnectionModal";
import { Button } from "@src/components/shared/Button";
import { SMART_CONTRACT_ID_DECIMAL } from "@src/utils/constants/appInfo";
import { ClaimingPageContext } from "@src/utils/context/ClaimingPageContext";
import { useClaiming } from "@src/utils/hooks/claiming/useClaiming";
import useContractState from "@src/utils/hooks/contract/useContractState";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import { useModal } from "@src/utils/hooks/useModal";
import React from "react";

export const ClaimingPage: React.FC = () => {
  const { toggleModal } = useModal("WalletConnectionModal");
  const { userWalletId, disconnect, isWalletConnected } = useHederaWallets();
  const { isDataLoading, requiredAllowlistAddresses, nftCollectionOnChainMetadata } = useContractState();
  const { toggleModal: toggleWalletConnectionModal } = useModal(
    "WalletConnectionModal"
  );
  const claimingPageContextValues = useClaiming(SMART_CONTRACT_ID_DECIMAL);

  if (isDataLoading) {
    return (
      <p className="w-full font-extrabold flex justify-center text-xl">
        Loading...
      </p>
    );
  }

  return (
    <ClaimingPageContext.Provider value={claimingPageContextValues}>
      <WalletConnectionModal />
      <div className="left-0 flex items-center mb-6 w-full top-10 z-0">
        <p className="w-full text-center text-lg">
          Contract Number
          <span className="ml-6 text-black text-xl">
            {SMART_CONTRACT_ID_DECIMAL}
          </span>
        </p>
        <div className="absolute right-12">
          <Button
            size="small"
            label={isWalletConnected ? "Disconnect" : "Connect Wallet"}
            className="bg-secondary text-textDefault text-[15px] "
            onClick={isWalletConnected ? disconnect : toggleModal}
          />
          {isWalletConnected && (
            <span className="absolute top-8 left-0 w-full whitespace-nowrap	text-[12px]">
              Wallet ID: {userWalletId}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col max-w-[684px] mx-auto mt-10">
        <div className="p-6 flex gap-12">
          <div className="flex flex-col w-1/2">
            <ImageColumn />

            <div>
              {userWalletId &&
              requiredAllowlistAddresses.length > 0 &&
              !requiredAllowlistAddresses.includes(userWalletId) ? (
                <div className="m-12">
                  <Button type="submit" className="mx-auto" disabled>
                    Your account is not allowed to claim
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col justify-center gap-2 p-4">
                  {userWalletId && nftCollectionOnChainMetadata?.token_id && (
                    <>
                      {!claimingPageContextValues.isAccountAssociatedToToken && (
                        <Button
                          type="submit"
                          className="mx-auto"
                          onClick={async () =>
                            await claimingPageContextValues.associateToken(
                              nftCollectionOnChainMetadata?.token_id || ""
                            )
                          }
                          disabled={!userWalletId}
                        >
                          Associate token
                        </Button>
                      )}

                      <ContractClaimingButton />
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center align-center gap-3 mt-8">
              {!userWalletId && (
                <div className="text-warning max-w-md flex justify-center align-center">
                  <Button
                    className="mx-auto"
                    label="Connect Wallet"
                    onClick={toggleWalletConnectionModal}
                  />
                </div>
              )}
            </div>
          </div>

          <ContractInformationColumn />
        </div>
      </div>
    </ClaimingPageContext.Provider>
  );
};
