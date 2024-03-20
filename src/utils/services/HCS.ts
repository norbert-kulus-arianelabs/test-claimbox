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

import Web3 from "web3";

const web3 = new Web3();

export class HederaContractService {
  private static config = {
    gas: {
      default: 100000,
      initializeContract: 10000000,
      getNFT: 1000000,
    },
    maxAttempts: 10,
    minBackoff: 100,
    maxBackoff: 1000,
  };

  public static getGas(functionName?: string): number {
    if (!functionName) return this.config.gas.default;
    return this.config.gas[functionName] || this.config.gas.default;
  }

  public static encodeFunctionCall(
    abi: Array<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    functionName: string,
    parameters: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Buffer {
    const functionAbi = abi.find(
      (func) => func.name === functionName && func.type === "function"
    );

    if (!functionAbi) {
      throw new Error(
        `Function ${functionName} not found in contract ABI`
      );
    }

    const encodedParametersHex = web3.eth.abi
      .encodeFunctionCall(functionAbi, parameters)
      .slice(2);
    return Buffer.from(encodedParametersHex, "hex");
  }
}