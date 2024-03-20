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

import type { ContractId } from "@hashgraph/sdk";
import { BigNumber, Contract, ethers } from "ethers";

export const estimateGas = async ({
  network,
  contractId,
  senderAddress,
  contractAbi,
  method,
  callArguments,
  payableValue,
}: {
  network: string;
  contractId: ContractId;
  senderAddress: string;
  contractAbi: ethers.ContractInterface;
  method: string;
  callArguments: unknown[];
  payableValue?: BigNumber;
}): Promise<number | null> => {
  let gas: number | null = null;

  try {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://${network}.hashio.io/api`
    );
    const myContract = new Contract(
      contractId.toSolidityAddress(),
      contractAbi
    );
    const populateTransaction = myContract?.populateTransaction?.[method];

    if (populateTransaction) {
      const txToEstimate = await populateTransaction(...callArguments);
      txToEstimate.from = senderAddress;
      if (payableValue) {
        txToEstimate.value = payableValue;
      }

      const gasEstimate = await provider.estimateGas(txToEstimate);
      gas = gasEstimate.toNumber();
    }
  } catch {
    return null;
  }

  return gas;
};
