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

import { ContractId } from "@hashgraph/sdk";
import { HederaDistributionContract } from "@src/utils/services/HDC";
import { HederaTokenService } from "@src/utils/services/HTS";
import { TokenDataInterface } from "@src/utils//types/TokenDataInterface";
import { fromEVMAddressToHederaAccountId } from "@src/utils/helpers/fromEVMAddressToHederaId";
import useClaimCounter from "@src/utils/hooks/claiming/useClaimCounter";
import useContractState from "@src/utils/hooks/contract/useContractState";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import { useCallback } from "react";
import { calculateMerkelProof } from "@src/utils/helpers/calculateMerkelLeavs";
import { useAccountAvailabilities } from "@src/utils/hooks/claiming/useAccountAvailabilities";
import { SMART_CONTRACT_ID_HEXADECIMAL } from "@src/utils/constants/appInfo";

export type RequiredAllowance = Pick<
  TokenDataInterface,
  "symbol" | "price" | "token_id"
> & {
  userAllowancesGivenForContractToSpendFT: number;
};

export const useClaiming = (contractId: ContractId | string) => {
  const { sendTransaction, userWalletId } = useHederaWallets();
  const { distributionDates, fetchContractStateWithDelay } = useContractState();
  const claimCounter = useClaimCounter(distributionDates);
  const {
    requiredAllowances,
    isAccountAssociatedToToken,
    invalidGatingTokens,
    invalidPaymentTokens,
    gas,
    userMintLimitExceeded,
    setAssociationWasSetManually,
    setIsAccountAssociatedToToken,
    checkIfIsAllowedToClaimWithFT,
    calculateGasForClaim,
    resetGas,
    calculateGasWithRetry,
    retriesCount,
  } = useAccountAvailabilities();

  const approveTokenAllowance = async (
    tokenId: string,
    amount: string
  ): Promise<boolean> => {
    if (!userWalletId) {
      return false;
    }

    if (tokenId.startsWith("0x")) {
      tokenId = fromEVMAddressToHederaAccountId(tokenId);
    }

    const approveAllowanceForTokenTransaction =
      HederaTokenService.createAccountAllowanceApproveTransaction(
        tokenId,
        userWalletId,
        contractId.toString(),
        amount
      );

    try {
      const receipt = await sendTransaction(
        approveAllowanceForTokenTransaction
      );

      if (!receipt) {
        return false;
      }

      return !!receipt;
    } catch {
      return false;
    }
  };

  const associateToken = async (tokenId: string) => {
    if (!userWalletId) {
      return;
    }

    const associateTokenTransaction =
      HederaTokenService.createAssociateTokenTransaction(userWalletId, tokenId);

    const receipt = await sendTransaction(associateTokenTransaction);

    if (!receipt) {
      return;
    }

    setIsAccountAssociatedToToken(true);
    setAssociationWasSetManually(true);
  };

  const claimToken = useCallback(
    async (paymentToken: string, price?: string, leaves: string[] = []) => {
      if (!userWalletId) {
        return;
      }

      const hederaContractId =
        typeof contractId === "string"
          ? ContractId.fromString(contractId)
          : contractId;

      const merkleProof = await calculateMerkelProof(leaves, userWalletId);

      const claimTransaction =
        await HederaDistributionContract.createGetNFTTransaction({
          contractId: hederaContractId,
          getNFT: { merkleProof, paymentToken },
          price: price ?? "",
          gas: gas.amount,
        });

      const receipt = await sendTransaction(claimTransaction);

      if (!receipt) {
        throw new Error(
          "Something went wrong while approving the token allowance."
        );
      }
      resetGas();
      fetchContractStateWithDelay(SMART_CONTRACT_ID_HEXADECIMAL, 5_000);
    },
    [contractId, sendTransaction, userWalletId, gas]
  );

  return {
    approveTokenAllowance,
    associateToken,
    claimToken,
    checkIfIsAllowedToClaimWithFT,
    calculateGasForClaim,
    resetGas,
    calculateGasWithRetry,
    isAccountAssociatedToToken,
    requiredAllowances,
    claimCounter,
    invalidGatingTokens,
    invalidPaymentTokens,
    gas,
    retriesCount,
    userMintLimitExceeded,
  };
};
