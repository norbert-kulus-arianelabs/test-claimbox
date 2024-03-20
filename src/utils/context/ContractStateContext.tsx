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

import { useEffect, createContext, useReducer, useState } from "react";
import { TokenDataInterface } from "@src/utils/types/TokenDataInterface";
import { contractReducer } from "@src/utils/reducers/contractReducer";
import {
  setTokenGatingRequiredFungibleTokenList,
  setRemainingDistributionAvailable,
  setTokenGatingRequiredNonFungibleTokenList,
  setMintLimit,
  setPaymentEnabled,
  setTokensDistributed,
  setTokensPriceData,
  setNFTCollectionOnChainMetadata,
  setTokenGated,
  setPreviewImage,
  setDistributionDates,
  setRequiredAllowlistAddresses,
} from "@src/utils/reducers/contractActions";
import { DistributionDates } from "@src/utils/entity/NFTInfo";
import {
  HederaDistributionContract,
  TokenGatingRequiredToken,
} from "@src/utils/services/HDC";
import { SMART_CONTRACT_ID_HEXADECIMAL } from "@src/utils/constants/appInfo";
import { getAllowListFromIPFS } from "@src/utils/helpers/getAllowListFromIPFS";
import MirrorNode from "@src/utils/services/MirrorNode";

export interface ContractState {
  remainingDistributionAvailable: number;
  mintLimit: string;
  paymentEnabled: boolean;
  tokenGatingRequiredFungibleTokenList: TokenGatingRequiredToken[];
  tokenGatingRequiredNonFungibleTokenList: TokenGatingRequiredToken[];
  tokenGated: boolean | null;
  tokensDistributed: number;
  tokensPriceData: TokenDataInterface[];
  nftCollectionOnChainMetadata: TokenDataInterface | null;
  previewImage: string | null;
  distributionDates: DistributionDates | null;
  isDataLoading: boolean;
  requiredAllowlistAddresses: string[];
  fetchContractStateWithDelay: (contractAddress: string, delayMS: number) => void
}

const INITIAL_CONTRACT_STATE = {
  remainingDistributionAvailable: 0,
  mintLimit: "",
  paymentEnabled: false,
  tokenGatingRequiredFungibleTokenList: [],
  tokenGatingRequiredNonFungibleTokenList: [],
  tokenGated: null,
  tokensDistributed: 0,
  tokensPriceData: [],
  nftCollectionOnChainMetadata: null,
  nftSerialData: null,
  nftSerialOffChainMetadata: null,
  previewImage: null,
  distributionDates: null,
  isDataLoading: true,
  requiredAllowlistAddresses: [],
  fetchContractStateWithDelay: () => undefined
};

export const ContractStateContext = createContext<ContractState>(
  INITIAL_CONTRACT_STATE
);

export const ContractStateProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): React.ReactNode => {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [state, dispatch] = useReducer(contractReducer, INITIAL_CONTRACT_STATE);

  const getRequiredAllowlistAddresses = async (): Promise<string[]> => {
    const link = await HederaDistributionContract.getAllowListLink();
    if (!link) {
      return [];
    }

    const allowList = await getAllowListFromIPFS(link);

    return (
      await Promise.all(
        allowList.map((address) => MirrorNode.getAccountDetails(address))
      )
    ).map(({ accountId }) => accountId);
  };

  const fetchContractStateData = async (contractAddress: string) => {
    setIsDataLoading(true);

    HederaDistributionContract.setContractAddress(contractAddress);

    const [
      remainingDistributionAvailableGateValue,
      tokenGatingRequiredFungibleTokenListValue,
      tokenGatingRequiredNonFungibleTokenListValue,
      mintLimitGateValue,
      enablePaymentGateValue,
      nftsDistributedGateValue,
      tokensPriceDataGateValue,
      previewImageGateValue,
      datesGateValue,
      requiredAllowlistAddresses,
      onChainMetadata
    ] = await Promise.all([
      HederaDistributionContract.getRemainingDistributionAvailable(),
      HederaDistributionContract.getTokenGatingRequiredTokenList("fungible"),
      HederaDistributionContract.getTokenGatingRequiredTokenList(
        "non-fungible"
      ),
      HederaDistributionContract.getMintLimit(),
      HederaDistributionContract.getEnablePayment(),
      HederaDistributionContract.getSNFTSDistributed(),
      HederaDistributionContract.getTokensPriceData(),
      HederaDistributionContract.getPreviewImage(),
      HederaDistributionContract.getDates(),
      getRequiredAllowlistAddresses(),
      HederaDistributionContract.getCollectionOnChainMetadata()
    ]);

    if (remainingDistributionAvailableGateValue) {
      setRemainingDistributionAvailable(
        remainingDistributionAvailableGateValue,
        dispatch
      );
    }

    if (tokenGatingRequiredFungibleTokenListValue) {
      setTokenGatingRequiredFungibleTokenList(
        tokenGatingRequiredFungibleTokenListValue,
        dispatch
      );
    }

    if (tokenGatingRequiredNonFungibleTokenListValue) {
      setTokenGatingRequiredNonFungibleTokenList(
        tokenGatingRequiredNonFungibleTokenListValue,
        dispatch
      );
    }

    if (mintLimitGateValue) {
      setMintLimit(mintLimitGateValue, dispatch);
    }

    if (enablePaymentGateValue) {
      setPaymentEnabled(enablePaymentGateValue, dispatch);
    }

    if (nftsDistributedGateValue) {
      setTokensDistributed(nftsDistributedGateValue, dispatch);
    }

    if (tokensPriceDataGateValue) {
      setTokensPriceData(tokensPriceDataGateValue, dispatch);
    }

    if (previewImageGateValue) {
      setPreviewImage(previewImageGateValue, dispatch);
    }

    if (datesGateValue) {
      setDistributionDates(datesGateValue, dispatch);
    }

    if (requiredAllowlistAddresses) {
      setRequiredAllowlistAddresses(requiredAllowlistAddresses, dispatch);
    }

    if (onChainMetadata) {
      setNFTCollectionOnChainMetadata(onChainMetadata, dispatch);
    }

    setIsDataLoading(false);
  };

  const fetchContractStateWithDelay = async (contractAddress: string, delayMS: number) => {
    setIsDataLoading(true);
    setTimeout(() => {
      fetchContractStateData(contractAddress)
    }, delayMS)
  }

  useEffect(() => {
    fetchContractStateData(SMART_CONTRACT_ID_HEXADECIMAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTokenGated(
      !!(
        state.tokenGatingRequiredFungibleTokenList.length ||
        state.tokenGatingRequiredNonFungibleTokenList.length
      ),
      dispatch
    );
  }, [
    state.tokenGatingRequiredFungibleTokenList,
    state.tokenGatingRequiredNonFungibleTokenList,
  ]);

  return (
    <ContractStateContext.Provider value={{ ...state, isDataLoading, fetchContractStateWithDelay }}>
      {children}
    </ContractStateContext.Provider>
  );
};
