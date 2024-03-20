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

import { Hbar, HbarUnit, TokenId } from "@hashgraph/sdk";
import { DEFAULT_POST_REQUEST_CONFIG } from "@src/utils/constants/defaultPostRequestConfig";
import { adjustNumberWithDecimals } from "@src/utils/helpers/adjustNumberWithDecimals";
import { convertContractAddress } from "@src/utils/helpers/convertContractAddress";
import { TokenDataInterface } from "@src/utils/types/TokenDataInterface";
import axios, { AxiosError } from "axios";
import { ethers } from "ethers";
import decimals from "@src/utils/abi/ERC20/Decimals.json";
import { TokenAmountVerificationResponse } from "@src/utils/types/TokenAmountVerificationResponse";

const HEDERA_NETWORK = import.meta.env.VITE_HEDERA_NETWORK as string;

const consoleWarnAxiosError = (e: unknown) => {
  if (e instanceof AxiosError) {
    console.warn({
      axiosError: {
        response: e.response,
        body: JSON.parse(e?.config?.data),
        messages: e.response?.data?._status?.messages,
      },
    });
  }
};

export default class MirrorNode {
  static url = `https://${
    HEDERA_NETWORK === "mainnet" ? "mainnet-public" : HEDERA_NETWORK
  }.mirrornode.hedera.com/api/v1`;
  static readonly instance = axios.create({
    baseURL: MirrorNode.url,
  });

  static async getFromContract(
    contractAddress: string,
    contract: ethers.utils.Interface,
    method: string,
    value?: [string]
  ) {
    try {
      const data = contract.encodeFunctionData(method, value);
      const requestBody = {
        data,
        to: contractAddress,
        ...DEFAULT_POST_REQUEST_CONFIG,
      };
      const response = await this.instance.post(`/contracts/call`, requestBody);
      const json = await response.data;
      const decodedData = contract.decodeFunctionResult(method, json.result);

      return decodedData;
    } catch (e) {
      consoleWarnAxiosError(e);

      return null;
    }
  }

  static async getTokenData(
    tokenId: string
  ): Promise<{ symbol: string; decimals: string; name: string }> {
    const response = await this.instance.get(`/tokens/${tokenId}`);
    const { symbol, decimals, name, token_id, max_supply } =
      await response.data;
    const objectToReturn = { symbol, decimals, name, token_id, max_supply };

    return objectToReturn;
  }

  static async getEvmAddressForAccount(accountId: string): Promise<string> {
    const response = await this.instance.get(`/accounts/${accountId}`);
    const { evm_address } = await response.data;

    return evm_address;
  }

  static async getBalanceOfToken(
    tokenId: string,
    walletId: string
  ): Promise<number | undefined> {
    const {
      data: { tokens },
    } = await this.instance.get(
      `/accounts/${walletId}/tokens?token.id=${tokenId}`
    );

    return tokens[0]?.balance;
  }

  // TODO dlaczego to robi cos z prices zamiast tylko fetchowac dane tokenow?
  static async getTokensData(
    tokensId: string[],
    prices?: number[]
  ): Promise<TokenDataInterface[]> {
    const promises = tokensId.map((id) => {
      if (id === "0x0000000000000000000000000000000000000000") {
        return Promise.resolve({
          name: "HBAR",
          symbol: "HBAR",
          decimals: "8",
        });
      }

      const convertedID = convertContractAddress(id);
      return MirrorNode.getTokenData(convertedID);
    });

    let responses = (await Promise.all(promises)) as TokenDataInterface[];

    if (prices) {
      responses = await Promise.all(
        responses.map(async (response, index) => {
          const decimals =
            response.name === "HBAR"
              ? 8
              : await MirrorNode.getDecimals(response.token_id || "");

          return {
            ...response,
            price: adjustNumberWithDecimals(prices[index], decimals),
          };
        })
      );
    }

    return responses;
  }

  static async checkTokenAssociationStatus(tokenId: string, accountId: string) {
    tokenId = tokenId.startsWith("0x")
      ? TokenId.fromSolidityAddress(tokenId).toString()
      : tokenId;

    const { data } = await this.instance.get(
      `/accounts/${accountId}/tokens?token.id=${tokenId}`
    );

    return Boolean(data.tokens.length);
  }

  static async checkIfHasEnoughToken(
    tokenId: string,
    accountId: string,
    requiredAmount: number
  ): Promise<TokenAmountVerificationResponse> {
    const validTokenId = tokenId.startsWith("0x")
      ? TokenId.fromSolidityAddress(tokenId).toString()
      : tokenId;

    if (validTokenId === "0.0.0") {
      // handle hbar balance
      const { data } = await this.instance.get(`/accounts/${accountId}`);

      const hbarBalance = Hbar.fromTinybars(data.balance.balance)
        .to(HbarUnit.Hbar)
        .toNumber();

      if (hbarBalance >= requiredAmount) {
        return {
          valid: true,
        };
      } else {
        return {
          valid: false,
          requiredAmount,
          userBallance: hbarBalance,
        };
      }
    }

    const { data } = await this.instance.get(
      `/accounts/${accountId}/tokens?token.id=${validTokenId}`
    );

    if (!data.tokens[0]) {
      return {
        valid: false,
        requiredAmount,
        userBallance: 0,
      };
    }

    if (requiredAmount > data.tokens[0].balance) {
      const decimals = await MirrorNode.getDecimals(tokenId);
      return {
        valid: false,
        requiredAmount,
        userBallance: adjustNumberWithDecimals(
          data.tokens[0].balance,
          decimals
        ).toNumber(),
      };
    }

    return {
      valid: true,
    };
  }

  static async getAllowancesForToken(
    wallet: string,
    contractId: string,
    tokenId: string
  ) {
    try {
      const { data } = await this.instance.get<{
        allowances: { amount: number }[];
      }>(
        `accounts/${wallet}/allowances/tokens?spender.id=${contractId.toString()}&token.id=${tokenId}`
      );

      const approvals = data.allowances || [];

      return approvals.length ? approvals[0]?.amount || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  static async getDecimals(tokenId: string): Promise<number | null> {
    const erc20 = new ethers.utils.Interface(decimals);

    const result = await MirrorNode.getFromContract(
      convertContractAddress(tokenId),
      erc20,
      "decimals"
    );

    if (!result) {
      return null;
    }

    return Number(result);
  }

  static async getAccountDetails(
    accountIdOrEVMAddress: string
  ): Promise<{ evm_address: string; accountId: string }> {
    const response = await this.instance.get(
      `/accounts/${accountIdOrEVMAddress}`
    );
    const { evm_address, account } = await response.data;

    return { evm_address, accountId: account };
  }
}
