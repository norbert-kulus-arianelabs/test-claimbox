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
  ContractExecuteTransaction,
  ContractId,
  TokenId,
} from "@hashgraph/sdk";
import {
  default as DistributionConctractAbi,
  default as SNFTSDistributedAbi,
  default as distributionContract,
} from "@src/utils/abi/DistributionContract.sol/DistributionContract.json";
import EndTimestampAbi from "@src/utils/abi/gates/EndTimestampGate.sol/EndTimestampGateContract.json";
import FTGateAbi from "@src/utils/abi/gates/FTGateContract.sol/FTGateContract.json";
import MintLimitAbi from "@src/utils/abi/gates/MintLimitGate.sol/MintLimitGateContract.json";
import NFTGateAbi from "@src/utils/abi/gates/NFTGateContract.sol/NFTGateContract.json";
import StartTimestampAbi from "@src/utils/abi/gates/StartTimestampGate.sol/StartTimestampGateContract.json";
import IPaymentAbi from "@src/utils/abi/interfaces/IPaymentModule.sol/IPaymentModule.json";
import CurrentSerialNumberAbi from "@src/utils/abi/modules/DefaultSerialNumberGeneratorContract.sol/DefaultSerialNumberGeneratorContract.json";
import HBARAndFTPaymentAbi from "@src/utils/abi/modules/HBARAndFTPaymentContract.sol/HBARAndFTPaymentContract.json";
import { DistributionDates } from "@src/utils/entity/NFTInfo";
import { handleSDKError } from "@src/utils/helpers/handleHashgraphSdkError";
import { TokenDataInterface } from "@src/utils/types/TokenDataInterface";
import { ethers } from "ethers";
import map from "lodash/map";
import { HederaContractService } from "./HCS";
import MirrorNode from "./MirrorNode";
import { adjustNumberWithDecimals } from "@src/utils/helpers/adjustNumberWithDecimals";
import { accountIdToEVMAddress } from "@src/utils/helpers/accountIdToEVMAddress";

export type Address = `0x${string}` | string;

export type TokenGatingRequiredToken = {
  tokenData: TokenDataInterface;
  address: string;
  amount: string;
};

export interface GetNFT {
  merkleProof: Array<string>;
  paymentToken: Address;
}

export class HederaDistributionContract extends HederaContractService {
  private static contractAddress: null | string;

  static setContractAddress(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  private static async getFromContract(
    contract: ethers.utils.Interface,
    method: string,
    value?: [string] | undefined
  ): Promise<ethers.utils.Result | null> {
    if (!this.contractAddress) {
      console.warn("Missing contractAddress in HederaDistributionContract");
      return null;
    }
    return MirrorNode.getFromContract(
      this.contractAddress,
      contract,
      method,
      value
    );
  }

  private static encodeDistributionFunctionCall(
    abi: unknown[],
    functionName: string,
    parameters: Array<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Buffer {
    return this.encodeFunctionCall(abi, functionName, parameters);
  }

  public static createGetNFTTransaction = async ({
    contractId,
    getNFT,
    price,
    gas,
  }: {
    contractId: ContractId;
    getNFT: GetNFT;
    price: string;
    gas: number | null;
  }) => {
    return handleSDKError(async () => {
      const functionCallAsUint8Array = this.encodeDistributionFunctionCall(
        distributionContract.abi,
        "getNFT",
        [getNFT]
      );

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array);

      if (
        getNFT.paymentToken === "0x0000000000000000000000000000000000000000" &&
        price
      ) {
        transaction.setPayableAmount(price);
      }

      return transaction.setGas(gas || this.getGas("getNFT"));
    });
  };

  static async getRemainingDistributionAvailable(): Promise<number | null> {
    const distributionConctract = new ethers.utils.Interface(
      DistributionConctractAbi.abi
    );
    const result = await this.getFromContract(
      distributionConctract,
      "getSLeftToDistribute"
    );

    if (!result) {
      return result;
    }

    const number = Number(result);

    return number;
  }

  static async getDates(): Promise<DistributionDates> {
    const startTimestampContract = new ethers.utils.Interface(
      StartTimestampAbi.abi
    );
    const endTimestampContract = new ethers.utils.Interface(
      EndTimestampAbi.abi
    );
    let startDateTimestamp = 0;
    let endDateTimestamp = 0;

    try {
      startDateTimestamp = Number(
        await this.getFromContract(
          startTimestampContract,
          "getConfigStartTimestamp"
        )
      );
    } catch {
      /* empty */
    }

    try {
      endDateTimestamp = Number(
        await this.getFromContract(
          endTimestampContract,
          "getConfigEndTimestamp"
        )
      );
    } catch {
      /* empty */
    }

    return { startDateTimestamp, endDateTimestamp };
  }

  static async getTokenGatingTokenAddresses(
    type: "fungible" | "non-fungible" = "fungible"
  ): Promise<Omit<TokenGatingRequiredToken, "tokenData">[] | null> {
    const contract = new ethers.utils.Interface(
      type === "fungible" ? FTGateAbi.abi : NFTGateAbi.abi
    );
    const contractCallSurfix =
      type === "fungible" ? "getRequiredFT" : "getRequiredNFT";

    const result = await this.getFromContract(
      contract,
      `${contractCallSurfix}Addresses`
    );

    if (!result) {
      return result;
    }

    const addresses: Omit<TokenGatingRequiredToken, "tokenData">[] =
      await Promise.all(
        result[0].map(async (address: string) => {
          const amount = await this.getFromContract(
            contract,
            `${contractCallSurfix}Balance`,
            [address]
          );

          return {
            address,
            amount: Number(amount),
          };
        })
      );

    return addresses;
  }

  static async getMintLimit(): Promise<string | null> {
    const mintLimitContract = new ethers.utils.Interface(MintLimitAbi.abi);
    const result = await this.getFromContract(
      mintLimitContract,
      "getConfigMintLimitPerWallet"
    );

    if (!result) {
      return result;
    }

    const mintLimit = result.toString();

    return mintLimit;
  }

  static async getEnablePayment(): Promise<boolean | null> {
    const iPaymentContract = new ethers.utils.Interface(IPaymentAbi.abi);
    const result = await this.getFromContract(
      iPaymentContract,
      "getEnablePayment"
    );

    if (!result) {
      return result;
    }

    return result[0];
  }

  static async getSNFTSDistributed(): Promise<number> {
    const tokensDistributedContract = new ethers.utils.Interface(
      SNFTSDistributedAbi.abi
    );
    const result = await this.getFromContract(
      tokensDistributedContract,
      "getSNFTSDistributed"
    );
    const number = Number(result);

    return number;
  }

  static async getHBARAndFTPaymentData(): Promise<{
    paymentAddresses: string[];
    formattedPaymentAmountResult: number[];
  }> {
    const hbarAndFTPaymentContract = new ethers.utils.Interface(
      HBARAndFTPaymentAbi.abi
    );
    const paymentAddressesResult = await this.getFromContract(
      hbarAndFTPaymentContract,
      "getTokenPaymentAddresses"
    );
    const paymentAddresses = ((paymentAddressesResult ?? [])[0] ?? []).map(
      (address: string) => address
    );

    const paymentAmountResult = paymentAddresses.map(
      async (address: string) => {
        const response = await this.getFromContract(
          hbarAndFTPaymentContract,
          "getTokenPaymentAmount",
          [address]
        );

        return response;
      }
    );

    const responseArray = await Promise.all(paymentAmountResult);
    const formattedPaymentAmountResult = responseArray.map((amount) =>
      Number(amount)
    );

    return { paymentAddresses, formattedPaymentAmountResult };
  }

  static async getSNFTSDistributedAddress(): Promise<string | null> {
    const tokensDistributedAddressContract = new ethers.utils.Interface(
      SNFTSDistributedAbi.abi
    );
    const result = await this.getFromContract(
      tokensDistributedAddressContract,
      "getSNFTToDistributeAddress"
    );

    if (!result) {
      return result;
    }

    return result[0];
  }

  static async getLastMintedSerialNumber(): Promise<string | null> {
    const currentSerialNumberContract = new ethers.utils.Interface(
      CurrentSerialNumberAbi.abi
    );
    const result = await this.getFromContract(
      currentSerialNumberContract,
      "getLastMintedSerialNumber"
    );

    if (!result) {
      return result;
    }

    return result.toString();
  }

  static async getPreviewImage(): Promise<string> {
    const abiInterface = new ethers.utils.Interface(
      DistributionConctractAbi.abi
    );
    const result = await this.getFromContract(
      abiInterface,
      "getSClaimingPreviewImageURL"
    );

    return String(result);
  }

  static async getTokenGatingRequiredTokenList(
    type: "fungible" | "non-fungible" = "fungible"
  ): Promise<TokenGatingRequiredToken[] | null> {
    const addresses =
      await HederaDistributionContract.getTokenGatingTokenAddresses(type);

    if (!addresses) {
      return addresses;
    }

    const addressesWithTokenData = await Promise.all(
      map(addresses, async (address) => ({
        ...address,
        tokenData: await MirrorNode.getTokenData(
          TokenId.fromSolidityAddress(address.address).toString()
        ),
      }))
    );

    if (type === "fungible") {
      return Promise.all(
        addressesWithTokenData.map(async (data) => {
          const decimals = await MirrorNode.getDecimals(
            TokenId.fromSolidityAddress(data.address).toString()
          );
          return {
            ...data,
            amount: adjustNumberWithDecimals(data.amount, decimals).toString(),
          };
        })
      );
    }

    return addressesWithTokenData;
  }

  static async getTokensPriceData(): Promise<TokenDataInterface[] | null> {
    const { paymentAddresses, formattedPaymentAmountResult } =
      await HederaDistributionContract.getHBARAndFTPaymentData();

    if (!paymentAddresses) {
      return null;
    }

    return MirrorNode.getTokensData(
      paymentAddresses,
      formattedPaymentAmountResult
    );
  }

  static async getCollectionOnChainMetadata(): Promise<TokenDataInterface | null> {
    const address =
      await HederaDistributionContract.getSNFTSDistributedAddress();

    if (!address) {
      return null;
    }

    const data = await MirrorNode.getTokensData([address]);

    return data[0];
  }

  static async getAllowListLink(): Promise<string> {
    const abiInterface = new ethers.utils.Interface(
      DistributionConctractAbi.abi
    );
    const result = await this.getFromContract(abiInterface, "getSAllowListURL");

    if (!result) {
      return "";
    }

    return String(result[0]);
  }

  static async getConfigMintLimitUsedForWallet(
    accountId: string
  ): Promise<number | null> {
    const abiInterface = new ethers.utils.Interface(
      DistributionConctractAbi.abi
    );

    const accountAddress = await accountIdToEVMAddress(accountId);

    const result = await this.getFromContract(
      abiInterface,
      "getConfigMintLimitUsedForWallet",
      [accountAddress]
    );

    if (!result) {
      return null;
    }

    return Number(result[0]);
  }
}
