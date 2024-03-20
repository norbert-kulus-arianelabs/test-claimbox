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

import { DistributionDates } from "@src/utils/entity/NFTInfo";
import { timestampToString } from "@src/utils/helpers/timestampToString";
import { formatDate } from "@src/utils/helpers/formatDate";
import { useEffect, useState } from "react";

type ClaimingStatus = 'countToStart'|'countToEnd'|'expired'|'noLimits';

export interface ClaimCounterReturn {
  startDate: string | null;
  endDate: string | null;
  timeToDistributionEnd: string | null;
  timeToDistributionStart: string | null;
  claimingStatus: ClaimingStatus;
}

const useClaimCounter = (
  dates: DistributionDates | null
): ClaimCounterReturn => {
  const [timeToDistributionStart, setTimeToDistributionStart] = useState<string | null>(null);
  const [timeToDistributionEnd, setTimeToDistributionEnd] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [claimingStatus, setClaimingStatus] = useState<ClaimingStatus>('countToStart');
  const now = Math.floor(new Date().getTime() / 1000);

  useEffect(() => {
    if(
      (!dates) ||
      (!dates?.startDateTimestamp && !dates?.endDateTimestamp) || 
      (dates?.startDateTimestamp && now > dates.startDateTimestamp && !dates.endDateTimestamp)
    ) {
      setClaimingStatus('noLimits');
    }

    if(dates?.endDateTimestamp && now > dates.endDateTimestamp) {
      setClaimingStatus('expired');
    }

    if(dates?.startDateTimestamp && now < dates.startDateTimestamp) {
      setClaimingStatus('countToStart')
    }

    if(
      dates?.endDateTimestamp && 
      now < dates.endDateTimestamp && 
      dates.startDateTimestamp && 
      now > dates.startDateTimestamp
    ) {
      setClaimingStatus('countToEnd')
    }

  }, [
    dates, 
    dates?.endDateTimestamp, 
    dates?.startDateTimestamp, 
    endDate, 
    now, 
    startDate, 
    timeToDistributionEnd, 
    timeToDistributionStart
  ])

  useEffect(() => {
    if (!dates) return;

    if (dates.startDateTimestamp !== 0) {
      setStartDate(formatDate(new Date(dates.startDateTimestamp * 1000)));
    }

    if (dates.endDateTimestamp !== 0) {
      setEndDate(formatDate(new Date(dates.endDateTimestamp * 1000)));
    }

    const intervalId = setInterval(() => {
      if (now > dates.startDateTimestamp) {
        setTimeToDistributionStart(null);
      } else {
        setTimeToDistributionStart(timestampToString(dates.startDateTimestamp - now));
      }

      if (now > dates.endDateTimestamp) {
        setTimeToDistributionEnd(null);
      } else {
        setTimeToDistributionEnd(timestampToString(dates.endDateTimestamp - now));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dates, now]);

  return {
    startDate,
    endDate,
    timeToDistributionEnd,
    timeToDistributionStart,
    claimingStatus
  };
};

export default useClaimCounter;
