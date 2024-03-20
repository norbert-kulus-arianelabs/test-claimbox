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

import {
  SMART_CONTRACT_ID_DECIMAL,
  SMART_CONTRACT_ID_HEXADECIMAL,
} from "@src/utils/constants/appInfo";
import useContractState from "@src/utils/hooks/contract/useContractState";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import MirrorNode from "@src/utils/services/MirrorNode";
import { TokenWithInvalidTokenAmountResponse } from "@src/utils/types/TokenAmountVerificationResponse";
import { TokenDataInterface } from "@src/utils/types/TokenDataInterface";
import findIndex from "lodash/findIndex";
import map from "lodash/map";
import { useEffect, useState } from "react";
import { checkIfUserHasEnoughTokens } from "@src/utils/helpers/checkIfUserHasEnoughTokens";
import { useGasEstimation } from "@src/utils/hooks/claiming/useGasEstimation";
import { HederaDistributionContract } from "@src/utils/services/HDC";

export type RequiredAllowance = Pick<
  TokenDataInterface,
  "symbol" | "price" | "token_id"
> & {
  userAllowancesGivenForContractToSpendFT: number;
};

export const useAccountAvailabilities = () => {
  const {
    nftCollectionOnChainMetadata,
    tokensPriceData,
    tokenGated,
    tokenGatingRequiredFungibleTokenList,
    tokenGatingRequiredNonFungibleTokenList,
    mintLimit,
    isDataLoading
  } = useContractState();
  const { userWalletId } = useHederaWallets();
  const {
    gas,
    calculateGasForClaim,
    resetGas,
    calculateGasWithRetry,
    retriesCount,
  } = useGasEstimation();
  const [requiredAllowances, setRequiredAllowances] = useState<
    RequiredAllowance[]
  >([]);

  const [isAccountAssociatedToToken, setIsAccountAssociatedToToken] =
    useState(false);

  const [associationWasSetManually, setAssociationWasSetManually] =
    useState(false);

  const [invalidGatingTokens, setInvalidGatingTokens] = useState<
    TokenWithInvalidTokenAmountResponse[]
  >([]);

  const [invalidPaymentTokens, setInvalidPaymentTokens] = useState<
    TokenWithInvalidTokenAmountResponse[]
  >([]);

  const [userMintLimitExceeded, setUserMintLimitExceeded] =
    useState<boolean>(false);

  const checkIfIsAllowedToClaimWithFT = async (
    tokenId: string,
    price: string
  ) => {
    if (!userWalletId) {
      return;
    }

    const allowances = await MirrorNode.getAllowancesForToken(
      userWalletId,
      SMART_CONTRACT_ID_DECIMAL,
      tokenId
    );
    const isTokenAllowedToClaim = allowances >= Number(price);

    const indexOfFTInRequiredAllowances = findIndex(
      requiredAllowances,
      ({ token_id }) => token_id === tokenId
    );

    if (indexOfFTInRequiredAllowances > -1) {
      setRequiredAllowances((prev) => {
        prev[
          indexOfFTInRequiredAllowances
        ].userAllowancesGivenForContractToSpendFT = allowances;

        return prev;
      });
    }

    return isTokenAllowedToClaim;
  };

  useEffect(() => {
    (async () => {
      if (!tokensPriceData.length || !userWalletId) {
        return;
      }

      const invalidPaymentTokens = await checkIfUserHasEnoughTokens(
        userWalletId,
        tokensPriceData
      );

      setInvalidPaymentTokens(invalidPaymentTokens);
    })();
  }, [tokensPriceData, userWalletId]);

  useEffect(() => {
    (async () => {
      if (!tokenGated || !userWalletId) {
        return;
      }

      const gatingTokensData = [
        ...tokenGatingRequiredFungibleTokenList,
        ...tokenGatingRequiredNonFungibleTokenList,
      ];

      const invalidGatingTokens = await checkIfUserHasEnoughTokens(
        userWalletId,
        gatingTokensData
      );
      setInvalidGatingTokens(invalidGatingTokens);
    })();
  }, [
    tokenGated,
    tokenGatingRequiredFungibleTokenList,
    tokenGatingRequiredNonFungibleTokenList,
    userWalletId,
  ]);

  useEffect(() => {
    (async () => {
      if (
        !userWalletId ||
        !nftCollectionOnChainMetadata?.token_id ||
        associationWasSetManually
      ) {
        return;
      }

      const isAccountAssociatedToToken =
        await MirrorNode.checkTokenAssociationStatus(
          nftCollectionOnChainMetadata?.token_id,
          userWalletId
        );

      setIsAccountAssociatedToToken(isAccountAssociatedToToken);
      setAssociationWasSetManually(true);
      return isAccountAssociatedToToken;
    })();
  }, [
    associationWasSetManually,
    nftCollectionOnChainMetadata?.token_id,
    userWalletId,
  ]);

  useEffect(() => {
    (async () => {
      if (!requiredAllowances.length && tokensPriceData && userWalletId) {
        const requiredAllowances = await Promise.all(
          map(tokensPriceData, async ({ token_id, price, symbol }) => ({
            token_id,
            price,
            symbol,
            userAllowancesGivenForContractToSpendFT: token_id // No token ID means it is HBAR.
              ? await MirrorNode.getAllowancesForToken(
                  userWalletId,
                  SMART_CONTRACT_ID_DECIMAL,
                  token_id ?? ""
                )
              : 0,
          }))
        );

        setRequiredAllowances(requiredAllowances);
      }
    })();
  }, [requiredAllowances.length, tokensPriceData, userWalletId]);

  useEffect(() => {
    if (userWalletId) {
      resetGas();
      setAssociationWasSetManually(false);
    }
  }, [resetGas, userWalletId]);

  useEffect(() => {
    (async () => {
      resetGas()
      if (userWalletId) {
        HederaDistributionContract.setContractAddress(
          SMART_CONTRACT_ID_HEXADECIMAL
        );
        const userLimit =
          await HederaDistributionContract.getConfigMintLimitUsedForWallet(
            userWalletId
          );

        if (userLimit !== null && !Number.isNaN(Number(mintLimit))) {
          setUserMintLimitExceeded(userLimit >= Number(mintLimit));
        }
      }
    })();
  }, [userWalletId, isDataLoading]);

  return {
    requiredAllowances,
    isAccountAssociatedToToken,
    invalidGatingTokens,
    invalidPaymentTokens,
    gas,
    userMintLimitExceeded,
    setIsAccountAssociatedToToken,
    setAssociationWasSetManually,
    checkIfIsAllowedToClaimWithFT,
    setRequiredAllowances,
    calculateGasForClaim,
    resetGas,
    calculateGasWithRetry,
    retriesCount,
  };
};
