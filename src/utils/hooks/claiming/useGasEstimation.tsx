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
  HEDERA_NETWORK,
  SMART_CONTRACT_ID_DECIMAL,
} from "@src/utils/constants/appInfo";
import { accountIdToEVMAddress } from "@src/utils/helpers/accountIdToEVMAddress";
import { calculateMerkelProof } from "@src/utils/helpers/calculateMerkelLeavs";
import { estimateGas } from "@src/utils/helpers/estimateGas";
import useHederaWallets from "@src/utils/hooks/wallets/useHederaWallets";
import { useCallback, useState } from "react";
import { default as distributionContract } from "@src/utils/abi/DistributionContract.sol/DistributionContract.json";
import { ContractId } from "@hashgraph/sdk";
import { BigNumber } from "ethers";
import { delay } from "@src/utils/helpers/delay";

type GasStatus =
  | { status: "idle"; amount: null }
  | { status: "loading"; amount: null }
  | { status: "success"; amount: null | number };

export const useGasEstimation = () => {
  const { userWalletId } = useHederaWallets();
  const [gas, setGas] = useState<GasStatus>({ status: "idle", amount: null });
  const [retriesCount, setRetriesCount] = useState(0);

  const calculateGasForClaim = async (
    paymentToken: string,
    leaves: string[] = [],
    payableValue?: BigNumber
  ): Promise<number | null | undefined> => {
    if (!userWalletId) {
      return;
    }
    setGas({ status: "loading", amount: null });

    const hederaContractId = ContractId.fromString(SMART_CONTRACT_ID_DECIMAL);
    const merkleProof = await calculateMerkelProof(leaves, userWalletId);
    const senderAddress = await accountIdToEVMAddress(userWalletId);

    const gas = await estimateGas({
      network: HEDERA_NETWORK,
      contractId: hederaContractId,
      senderAddress,
      contractAbi: distributionContract.abi,
      method: "getNFT",
      callArguments: [
        {
          merkleProof,
          paymentToken,
        },
      ],
      payableValue,
    });

    setGas({ status: "success", amount: gas });

    return gas;
  };

  const calculateGasWithRetry = async (
    {
      paymentToken,
      leaves,
      payableValue,
    }: { paymentToken: string; leaves?: string[]; payableValue?: BigNumber },
    { retriesIntervalMS }: { retriesIntervalMS: number[] }
  ) => {
    const gas = await calculateGasForClaim(paymentToken, leaves, payableValue);

    let i = 0;
    if (!gas && retriesIntervalMS.length) {
      for await (const intervalDelay of retriesIntervalMS) {
        await delay(intervalDelay);
        const success = await calculateGasForClaim(
          paymentToken,
          leaves,
          payableValue
        );
        
        i++;
        setRetriesCount(i);

        if (success) {
          break;
        }
      }
    }
  };

  const resetGas = useCallback((): void => {
    setGas({ status: "idle", amount: null });
    setRetriesCount(0);
  }, []);

  return {
    gas,
    retriesCount,
    calculateGasForClaim,
    calculateGasWithRetry,
    resetGas,
  };
};
