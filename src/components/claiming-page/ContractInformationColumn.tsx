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

import useContractState from "@src/utils/hooks/contract/useContractState";
import { Separator } from "@src/components/shared/Separator";
import { BasicInformation } from "@src/components/claiming-page/contract-information/BasicInformation";
import { OnChainTokenMetadata } from "@src/components/claiming-page/contract-information/OnChainTokenMetadata";
import { OtherGuards } from "@src/components/claiming-page/contract-information/OtherGuards";

export const ContractInformationColumn: React.FC = () => {
  const {
    mintLimit,
    tokenGatingRequiredNonFungibleTokenList,
    tokenGatingRequiredFungibleTokenList,
    tokenGated,
    remainingDistributionAvailable,
    tokensDistributed,
    nftCollectionOnChainMetadata,
  } = useContractState();

  return (
    <div className="w-1/2 min-w-[420px] flex flex-col gap-3">
      <BasicInformation
        tokenName={nftCollectionOnChainMetadata?.name || "-"}
        remainingDistributionAvailable={remainingDistributionAvailable}
        tokensDistributed={tokensDistributed}
      />

      <Separator />

      <OtherGuards
        tokenGated={tokenGated}
        mintLimit={mintLimit}
        tokenGatingRequiredFungibleTokenList={
          tokenGatingRequiredFungibleTokenList
        }
        tokenGatingRequiredNonFungibleTokenList={
          tokenGatingRequiredNonFungibleTokenList
        }
      />

      <Separator />

      <OnChainTokenMetadata
        nftCollectionOnChainMetadata={nftCollectionOnChainMetadata}
      />

      <Separator />
    </div>
  );
};
